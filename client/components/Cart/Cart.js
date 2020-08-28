import {List, Divider} from 'antd';
import styles from './Cart.module.css';
import OrderSummary from '../OrderSummary/OrderSummary';


export default function Cart({data}) {
  const getTotal = data => {
    let sum = 0;
    for (let products of data.values()) {
      for(let product of products) {
        sum += product.price;
      }
    }
    return sum;
  };
  return (
    <div className={styles.container}>
      <List className={styles.cart} dataSource={data.keys()} bordered
        renderItem={product => 
          <>
            <Divider orientation='left' className={styles.divider}>{product}</Divider>
            {data.get(product).map(i =>
              <List.Item>{i.productName}</List.Item>
            )}
          </>
        }
      />
      <OrderSummary data = {getTotal(data)} saved = {0.00}></OrderSummary>
    </div>
  );
}

