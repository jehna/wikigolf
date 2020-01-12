# Wikigolf

> Find shortest amount of clicks between two Wikipedia pages

If you start from the Wikipedia page [Helsinki](), what is the least amount of
clicks you can do to get to the page of [Avengers: Endgame]()?

The answer is 4 clicks:

1. [Winter Soistice](https://fi.wikipedia.org/wiki/Talvip%C3%A4iv%C3%A4nseisaus)
2. [December 21st](https://fi.wikipedia.org/wiki/21._joulukuuta)
3. [Samuel L. Jackson](https://fi.wikipedia.org/wiki/Samuel_L._Jackson)
4. [Avengers: Endgame](https://fi.wikipedia.org/wiki/Avengers:_Endgame)

This project answers the same question for any two pages at Wikipedia by doing a
_breadth-first_ search against Wikipedia database imported to Google BigQuery.

## Try it out!

You can try the search out yourself by going to url:

https://wikigolf1.herokuapp.com/

(notice that this service is running on free Heroku instance, so cold start
potentially takes a bit of time)

## Developing

To test this project out yourself you'll need to load all page and pagelinks
data from Wikipedia. Here's how:

### 1. Download necessary data from Wikipedia

Here are links to download all data from Finnish wikipedia:

- All links between all Wikipedia pages: https://dumps.wikimedia.your.org/fiwiki/latest/fiwiki-latest-pagelinks.sql.gz
- All pages' metadata: https://dumps.wikimedia.your.org/fiwiki/latest/fiwiki-latest-page.sql.gz

There's a script at [converter/](converter/) folder that downloads the data and
streams it to .tsv files. The `load_to_bigquery.sh` both loads the files and
uploads the results to BigQuery. Note that you should have `bq` CLI client
installed on your machine.

Usage:

```sh
./converter/load_to_bigquery.sh fi
```

Running this script creates and uploads the `fi` wikipedia files to BigQuery.

### 2. Allow API access to BigQuery.

Then create a Google Cloud IAM service account to fill in your .env file for
keys you can find at [`.env-example`](.env-example).

Remember to enable BigQuery API access from the console too!

### 3. Start the dev server

You can install the npm dependencies by running:

```
yarn
```

And start the project locally by running:

```
yarn dev
```

This starts Heroku and Webpack, and starts watching for your files for changes.

## Features

This project

- Is a website and an API
  - Website uses awesome Focal library from Grammarly
  - Full stack
    - React
    - Koa
    - Foal
    - Google BigQuery
    - TypeScript
    - Heroku
    - Styled Components
- Does a breadth-first search from a Wikipedia page name to another Wikipedia
  page name by using link relations between those pages
- Website works only on Finnish wikipedia site now, but the search should work
  just fine with any Wikipedia dump
- Limits the search to maximum of 5 steps
  - With an average page having ~30 links to other pages, this means the 5 steps
    should cover the whole wikipedia over 33 times

## Deploying

This project can be deployed to Heroku, with same environment variables that
you're using locally.

You can use Github Actions (or any other CI) to keep your porject up-to-date
with periodic data updates

### Setup CI

1. Create a service account to Google Cloud with at least the BigQuery Admin
   permission and download the `secrets.json` file to your computer.
2.

## Contributing

If you'd like to contribute, please fork the repository and use a feature
branch. Pull requests are warmly welcome.

## Licensing

The code in this project is licensed under MIT license.
