import {List, Typography, Divider} from 'antd';
import CartItem from '../CartItem/CartItem';
import styles from './Cart.module.css';


export default function Cart({data}) {
    return (
      <List
        bordered
        className={styles.cart}
        dataSource={data.keys()}
        renderItem={product => 
          <>
            <Divider>{product}</Divider>
            {data.get(product).map(i =>
              <CartItem
                {...i}
              />
            )}
          </>
        }
      />
    );
}