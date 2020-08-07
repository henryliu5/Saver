import styles from './CartItem.module.css';
import {Card} from "antd";


export default function CartItem({retailer, productName, rating, price}) {
    console.log(retailer);
    return (
        <Card className={styles.card}>
            <div className={styles.content}>
                <p>Item Image</p>
                <div className={styles.info}>
                    <p>Item Name: {productName}</p>
                    <p>Item Rating: {rating}</p>
                    <p>Item Price: {price} </p>
                </div>
            </div>
    </Card>
  );
}