
# Rebuilding the SQLITE database

## download the original data

Grab the dataset from [poloclub/diffusiondb](https://huggingface.co/datasets/poloclub/diffusiondb).

    git clone https://huggingface.co/datasets/poloclub/diffusiondb

After downloading the 2TB of data, you only need the json files...

## build the sqlite database

    python build_sqlite.py data.db ~/path/to/jsons

### Dream Schema

    "id TEXT PRIMARY KEY",
    "p text",
    "se integer",
    "c integer",
    "st integer",
    "sa text",

### Create FTS5 index
    
    CREATE VIRTUAL TABLE dreams_fts USING fts5 (p, content=dreams, tokenize = 'porter ascii'
    INSERT INTO dreams_fts (p) SELECT (p) FROM dreams

### query FTS5 index

    select * from prompts where rowid in (SELECT rowid FROM prompts_fts WHERE prompts_fts MATCH "unicorn" ORDER BY rank limit 50);

# local dev

    node server.js

# deploying

    flyctl deploy

# todo

- [ ] deploy api to fly via github actions
- [ ] openapi spec?
- [ ] have a help page
- [ ] link to a blog entry about it