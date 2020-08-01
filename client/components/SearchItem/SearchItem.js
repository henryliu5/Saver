import styles from './searchItem.module.css';
import { Card } from "antd";


export default function SearchItem({retailer, productName, price}) {
    return (
        <Card className={styles.search_card}>
            <div className={styles.search_content}>
                <p>Item Image</p>
                <div className={styles.search_info}>
                    <p>Item Name: {productName}</p>
                    <p>Item Price: {price} </p>
                </div>
            </div>
        </Card>
  );
}