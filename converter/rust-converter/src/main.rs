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
use std::fs;
use std::io::{self, prelude::*, BufReader};

#[derive(Debug, Serialize, Clone)]
struct Page {
  id: u32,
  name: String,
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

fn single_page_parser(input: &str) -> IResult<&str, Page> {
  let id_parser = map_res(digit1, parse_int);
  let important_values = tuple((id_parser, char(','), digit1, char(','), str_value));
  let single_insert = delimited(
    char('('),
    important_values,
    tuple((take_till(|c| c == ')'), char(')'))),
  );
  let parse_insert_to_page = map(single_insert, |(id, _, _, _, name)| Page { id, name });
  parse_insert_to_page(input)
}

fn parse_sql_file(input: &str) -> IResult<&str, Vec<Page>> {
  let full_line = preceded(crap, separated_list(char(','), single_page_parser));

  let many_lines = many1(full_line);

  let (input, res) = many_lines(input)?;
  let resres = res.concat();

  Ok((input, resres))
}

fn main() {
  let args: Vec<String> = std::env::args().collect();
  if args.len() < 2 {
    eprintln!("No file provided.\n\nUsage:\nrust-wiki-link-parser filename.sql");
  }
  let filename = &args[1];

  let mut file = fs::File::open(filename).unwrap();
  let reader = BufReader::new(&mut file);
  let mut wtr = WriterBuilder::new()
    .has_headers(false)
    .from_writer(io::stdout());

  let mut lines_read: u64 = 0;
  for line in reader.lines() {
    match line {
      Err(e) => {
        eprintln!("Error in line reading: {:?}", e);
      }
      Ok(single_line) => {
        let (_, results) = parse_sql_file(&*single_line).unwrap_or(("", Vec::new()));

        for result in results {
          wtr.serialize(result).unwrap();
        }
      }
    }

    lines_read = lines_read + 1;
    if lines_read % 100 == 0 {
      eprintln!("Lined read: {}", lines_read);
    }
  }

  wtr.flush().unwrap();
}

#[test]
fn str_value_tests() {
  assert_eq!(str_value("'hello'"), Ok(("", String::from("hello"))));
  assert_eq!(str_value("'hel\\'lo'"), Ok(("", String::from("hel'lo"))));
  assert_eq!(str_value("'hel\\\"lo'"), Ok(("", String::from("hel\"lo"))));
}
