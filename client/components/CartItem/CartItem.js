import styles from './CartItem.module.css';
import {Card} from "antd";


export default function Item({retailer, productName, rating, price}) {
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