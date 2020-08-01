import { Button, Space, Input, notification } from 'antd';
const { Search } = Input;
import ExpandingSearch from '../ExpandingSearch/ExpandingSearch';

import styles from './Home.module.css';

export default function Home() {
  return (
    <div>
      <h1 className={styles.title}>
        Type anything to start your search!
      </h1>
      <div className={styles.search}>
        <ExpandingSearch></ExpandingSearch>
      </div>
    </div>
  );
}

const openNotification = () => {
  fetch('/api/hello').then((response) => {
    response.json().then((data) => {
      console.log(data);
      notification.open({
        message: `Your name is ${data.name}`,
        description:
          'This is the content of the notification. This is the content of the notification. This is the content of the notification.',
        onClick: () => {
          console.log('Notification Clicked!');
        },
      });
    });
  });
};
