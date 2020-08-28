import Layout from '../components/Layout/Layout';
import Cart from '../components/Cart/Cart';
import {Button} from 'antd';
import {useState} from 'react';

let temp = [
    {
        "retailer": "Walmart",
        "productName": "Gala Apples, each",
        "rating": "5/5",
        "price": 1.06
    },
    {
        "retailer": "Walmart",
        "productName": "Natural Egg Carton 4/Pkg-6 Cavity",
        "rating": "5/5",
        "price": 1.06
    },
    {
        "retailer": "Walmart",
        "productName": "Honeycrisp Apples, 3 lb bag",
        "rating": "5/5",
        "price": 1.06
    },
    {
        "retailer": "Walmart",
        "productName": "Red Delicious Apples, 5 lb Bag",
        "rating": "5/5",
        "price": 1.06
    },
    {
        "retailer": "Target",
        "productName": "Chewy Chocolate Chip Cookies - 13oz - Market Pantry™",
        "rating": "5/5",
        "price": 1.06
    },
    {
        "retailer": "Target",
        "productName": "Banana - each",
        "rating": "3/5",
        "price": 1.09
    },
    {
        "retailer": "Target",
        "productName": "Little Debbie Nutty Bars - 12ct",
        "rating": "5/5",
        "price": 1.06
    },
    {
        "retailer": "Target",
        "productName": "Chiquita Plantain Bananas",
        "rating": "3/5",
        "price": 1.09
    },
    {
        "retailer": "Kroger",
        "productName": "Apple - Honeycrisp",
        "rating": "5/5",
        "price": 1.06
    },
    {
        "retailer": "Walmart",
        "productName": "Organic Gala Apples, 3 lb bag",
        "rating": "5/5",
        "price": 1.06
    },
    {
        "retailer": "Kroger",
        "productName": "Apple - Granny Smith - Small",
        "rating": "5/5",
        "price": 1.06
    },
];

export default function Contact(){
    const [data, addToData] = useState(new Map());
    const addData = item => {
        if(data.has(item.retailer)) {
            addToData(new Map(data.set(item.retailer, data.get(item.retailer).concat(item))));
        } else {
            addToData(new Map(data.set(item.retailer, [item])));
        }
    }
    let i = 0;
    return (
        <>
        <Layout content={
            <>
            <Button onClick={() => addData(temp.pop())}>Add</Button>
            <Cart data={data}></Cart>
            </>
        } menuHighlight='2'>
        </Layout>
        </>
    );
}


