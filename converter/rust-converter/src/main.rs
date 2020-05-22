extern crate nom;

use csv::WriterBuilder;
use nom::{
  branch::alt,
  bytes::complete::{escaped_transform, is_not, tag, take_till},
  character::complete::{anychar, char, digit1},
  combinator::{map, map_res},
  multi::{many1, many_till, separated_list},
  sequence::{delimited, preceded, terminated, tuple},
  IResult,
};
use serde::Serialize;
use std::collections::HashMap;
use std::fs;
use std::io::{prelude::*, BufReader};

#[derive(Debug, Serialize, Clone)]
struct Page {
  id: u32,
  name: String,
}

#[derive(Debug, Serialize, Clone)]
struct PageLink {
  from: u32,
  to: u32,
}

fn parse_int(input: &str) -> Result<u32, std::num::ParseIntError> {
  u32::from_str_radix(input, 10)
}

fn crap(input: &str) -> IResult<&str, &str> {
  let insert = tuple((
    tag("INSERT INTO "),
    alt((tag("`pagelinks`"), tag("`page`"))),
    tag(" VALUES "),
  ));
  terminated(tag(""), many_till(anychar, insert))(input)
}

fn str_value(input: &str) -> IResult<&str, String> {
  let unquote = escaped_transform(is_not("\\\'"), '\\', anychar);
  delimited(char('\''), unquote, char('\''))(input)
}

fn single_page_parser(input: &str) -> IResult<&str, Option<Page>> {
  let id_parser = map_res(digit1, parse_int);
  let important_values = tuple((id_parser, char(','), digit1, char(','), str_value));
  let single_insert = delimited(
    char('('),
    important_values,
    tuple((take_till(|c| c == ')'), char(')'))),
  );
  let parse_insert_to_page = map(single_insert, |(id, _, namespace, _, name)| {
    if namespace == "0" {
      Some(Page { id, name })
    } else {
      None
    }
  });
  parse_insert_to_page(input)
}

fn parse_sql_file(input: &str) -> IResult<&str, Vec<Option<Page>>> {
  let full_line = preceded(crap, separated_list(char(','), single_page_parser));

  let many_lines = many1(full_line);

  let (input, res) = many_lines(input)?;
  let resres = res.concat();

  Ok((input, resres))
}

fn parse_file<F>(filename: String, mut on_line: F) -> Result<(), std::io::Error>
where
  F: FnMut(Page),
{
  let mut file = fs::File::open(filename)?;
  let reader = BufReader::new(&mut file);

  for line in reader.lines() {
    match line {
      Err(e) => {
        eprintln!("Error in line reading: {:?}", e);
      }
      Ok(single_line) => {
        let (_, results) = parse_sql_file(&*single_line).unwrap_or(("", Vec::new()));

        for result in results {
          if let Some(page) = result {
            on_line(page);
          }
        }
      }
    }
  }

  Ok(())
}

fn print_values_read_for_debug(lines_read: &mut u64) {
  *lines_read = *lines_read + 1;
  if *lines_read % 100000 == 0 {
    eprintln!("Items processed: {}", lines_read);
  }
}

fn main() -> Result<(), std::io::Error> {
  let args: Vec<String> = std::env::args().collect();
  if args.len() < 3 {
    eprintln!("No file provided.\n\nUsage:\nrust-wiki-link-parser directory locale");
  }
  let directory = &args[1];
  let locale = &args[2];

  let pages_in_filename = format!(
    "{directory}/{locale}wiki-latest-page.sql",
    directory = directory,
    locale = locale
  );
  let pagelinks_in_filename = format!(
    "{directory}/{locale}wiki-latest-pagelinks.sql",
    directory = directory,
    locale = locale
  );
  let pages_out_filename = format!(
    "{directory}/pages_{locale}.csv",
    directory = directory,
    locale = locale
  );
  let pagelinks_out_filename = format!(
    "{directory}/pagelinks_{locale}.csv",
    directory = directory,
    locale = locale
  );

  let mut pages_wtr = WriterBuilder::new()
    .has_headers(false)
    .from_path(pages_out_filename)?;
  let mut pagelinks_wtr = WriterBuilder::new()
    .has_headers(false)
    .from_path(pagelinks_out_filename)?;

  let mut page_map: HashMap<String, u32> = HashMap::new();
  let mut lines_read: u64 = 0;
  parse_file(pages_in_filename, |page| {
    pages_wtr.serialize(&page).unwrap();
    page_map.insert(page.name, page.id);

    print_values_read_for_debug(&mut lines_read);
  })?;
  pages_wtr.flush().unwrap();

  lines_read = 0;
  parse_file(pagelinks_in_filename, |pagelink| {
    if let Some(id) = page_map.get(&pagelink.name) {
      let link = PageLink {
        from: pagelink.id,
        to: *id,
      };
      pagelinks_wtr.serialize(link).unwrap();
    }
    print_values_read_for_debug(&mut lines_read);
  })?;
  pagelinks_wtr.flush().unwrap();

  Ok(())
}

#[test]
fn str_value_tests() {
  assert_eq!(str_value("'hello'"), Ok(("", String::from("hello"))));
  assert_eq!(str_value("'hel\\'lo'"), Ok(("", String::from("hel'lo"))));
  assert_eq!(str_value("'hel\\\"lo'"), Ok(("", String::from("hel\"lo"))));
}
