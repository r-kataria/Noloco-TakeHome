# Noloco - Full Stack Engineering Exercise API Documentation

## Overview

My solution uses **Express** (with **TypeScript**!) to implement the API. On startup, the `initialize` function is run, which fetches data from the endpoint, cleans it, and generates a schema from the data. The cleaned data and schema are stored in a couple of global variables.

The data types in the schema are inferred from the data and typecast to the most suitable type. The OPTION type was particularly tricky because it is technically the same as a string, and determining whether a field is an OPTION or TEXT can be difficult. In this implementation, if 5 or more unique values are detected, the data is classified as a TEXT otherwise, it is considered to be an OPTION.

I added a few of the extra features but the Delete and Patch end points are missing. Also pagination support isn't there. Ideally would use an ORM for this which would make the querying and data cleaning much more efficient. The nested loops during data processing aren't great to use but are needed since we need to check each key inside each record. 


## To Run
`npm install`


`npm run dev`

## Endpoints

The API exposes three routes:

### 1. `/schema`
- **Method:** `GET`
- Returns the schema generated from the data.

### 2. `/data`
- **Method:** `GET`
- **(Optional) Input:**

  ```json
  {
    "where": {
      "<field>": {
        "<op>": "<value>"
      },
      "<field>": {
        "<op>": "<value>"
      }
    },
    "orderBy": "<field>"
  }
  ```

    - **Operations (`<op>`):**
        - `"eq"`: Equal
        - `"lt"`: Less than
        - `"gt"`: Greater than
        - `"ne"`: Not Equal

- Returns a list of the data. Optionally filtered by the `where` condition and sorted by `orderBy` field.

### 3. `/data/:id`
- **Method:** `GET`
- Returns a single object if found, else returns a `"404"`.



## Screenshots

![SS1](docs/1.png)
![SS2](docs/2.png)
![SS3](docs/3.png)
![SS4](docs/4.png)
