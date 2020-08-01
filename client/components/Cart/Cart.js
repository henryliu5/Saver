import {List, Typography, Divider} from 'antd';
import CartItem from '../CartItem/CartItem';
import styles from './Cart.module.css';

const data = [
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

export default function Cart() {
    return (
        <List 
            header={<div>Cart</div>} 
            footer={<div>End of Cart</div>} 
            bordered
            className = {styles.cart} 
            dataSource={data} 
            renderItem={product => (
                <CartItem {...product}></CartItem>
            )}
        />
    );
}