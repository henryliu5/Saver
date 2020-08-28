
export default async (req, res) => {
  let zip = '75022';
  let query = 'apples';
  // var products = await fetch(
  //   `http://localhost:7000/data?productName=bananas&zip=75022`
  // );
  // products = await products.json();
  // console.log(products);
  res.statusCode = 200;
  res.json([{ name: "1" }, { name: "2" }, { name: "3" }]);
};
