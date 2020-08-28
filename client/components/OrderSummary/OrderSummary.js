import {Card} from 'antd';
import styles from './OrderSummary.module.css';

//TODO: figure out how to get this to stick to bottom of div container
export default function OrderSummary({data, saved}) {
    return(
        <Card title = "Order Summary" className={styles.OrderSummary}>
            <div className = {styles.space}></div>
            <p className = {styles.original}>Original: {data.toFixed(2)}</p>
            <p className = {styles.savings}>Savings: {saved.toFixed(2)}</p>
            <p className = {styles.total}>Total: {(data.toFixed(2) - saved).toFixed(2)}</p>
        </Card>
    );
}