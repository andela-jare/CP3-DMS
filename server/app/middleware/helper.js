/**
  * Method to verify that user is an Admin
  * to access Admin endpoints
  * @param{Number} query - Query type either limit or offset
  * @param{Number} min - A minimum number to check agsint
  * @return{Boolean} - returns true or false.
  */
export default function limitOffsetHelper(query, min) {
  if (query < min || query > 10) {
    return false;
  }
  return true;
}
