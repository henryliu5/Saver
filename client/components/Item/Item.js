import styles from './Item.module.css';
import {Card} from "antd";


export default function Item({retailer, name, rating, price}) {
    return (
        <Card title={retailer} extra={<a href="#">Add</a>} className={styles.card}>
            <div className={styles.content}>
                <p>Item Image</p>
                <div className={styles.info}>
                    <p>Item Name: {name}</p>
                    <p>Item Rating: {rating}</p>
                    <p>Item Price: {price} </p>
                </div>
            </div>
    </Card>
  );
}