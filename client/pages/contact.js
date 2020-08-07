import Layout from '../components/Layout/Layout';
import Cart from '../components/Cart/Cart';
import {Button} from 'antd';
import {useState} from 'react';

let temp = [
    {
        "retailer": "Walmart",
        "productName": "apple",
        "rating": "5/5",
        "price": "1.06/lb"
    },
    {
        "retailer": "Walmart",
        "productName": "apple",
        "rating": "5/5",
        "price": "1.06/lb"
    },
    {
        "retailer": "Walmart",
        "productName": "apple",
        "rating": "5/5",
        "price": "1.06/lb"
    },
    {
        "retailer": "Walmart",
        "productName": "apple",
        "rating": "5/5",
        "price": "1.06/lb"
    },
    {
        "retailer": "Target",
        "productName": "apple",
        "rating": "5/5",
        "price": "1.06/lb"
    },
    {
        "retailer": "Target",
        "productName": "banana",
        "rating": "3/5",
        "price": "1.09/lb"
    },
    {
        "retailer": "Target",
        "productName": "apple",
        "rating": "5/5",
        "price": "1.06/lb"
    },
    {
        "retailer": "Target",
        "productName": "banana",
        "rating": "3/5",
        "price": "1.09/lb"
    },
    {
        "retailer": "Kroger",
        "productName": "apple",
        "rating": "5/5",
        "price": "1.06/lb"
    },
    {
        "retailer": "Walmart",
        "productName": "banana",
        "rating": "5/5",
        "price": "1.06/lb"
    },
    {
        "retailer": "Kroger",
        "productName": "apple",
        "rating": "5/5",
        "price": "1.06/lb"
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


