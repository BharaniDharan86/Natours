/* eslint-disable no-unused-vars */
class APIFEATURE {
  // reqObj is an object

  //"req.query"-to read the query string of the url that requested
  // const { page, fields, sort, limit, ...reqObj } = req.query;
  constructor(query, queryString) {
    this.query = query;
    this.queryString = queryString;
  }

  filter() {
    const { page, limit, sort, fields, ...reqObj } = this.queryString;
    let queryStr = JSON.stringify(reqObj);

    //ADVANCED FIELDING
    queryStr = queryStr.replace(/\b(gte|lte|lt|gt)\b/g, (match) => `$${match}`);

    queryStr = JSON.parse(queryStr);

    this.query = this.query.find(queryStr);

    return this;
  }

  sortBy() {
    if (this.queryString.sort) {
      this.query = this.query.sort(this.queryString.sort);
    }
    return this;
  }

  field() {
    if (this.queryString.fields) {
      this.query = this.query.select(this.queryString.fields);
    }
    return this;
  }
}

module.exports = APIFEATURE;
