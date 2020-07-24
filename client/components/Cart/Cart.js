import {List, Typography, Divider} from 'antd';
import Item from '../Item/Item';
import styles from './Cart.module.css';

const data = [
    {
        "retailer": "Walmart",
        "productName": "apple",
        "Rating": "5/5",
        "Price": "1.06/lb"
    },
    {
        "retailer": "Target",
        "productName": "apple",
        "Rating": "5/5",
        "Price": "1.06/lb"
    },
    {
        "retailer": "Kroger",
        "productName": "apple",
        "Rating": "5/5",
        "Price": "1.06/lb"
    },
    {
        "retailer": "Walmart",
        "productName": "banana",
        "Rating": "5/5",
        "Price": "1.06/lb"
    },
    {
        "retailer": "Kroger",
        "productName": "apple",
        "Rating": "5/5",
        "Price": "1.06/lb"
    },
];

export default function Cart() {
    return (
        <List 
            header={<div>Cart</div>} 
            footer={<div>End of Cart</div>} 
            bordered
            className = {styles.cart} 
            dataSource={data} 
            renderItem={item => (
                <Item {...item}></Item>
            )}
        />
    );
}