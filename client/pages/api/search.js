export default (req, res) => {
  res.statusCode = 200;
  res.json([{ name: "1" }, { name: "2" }, { name: "3" }]);
};
