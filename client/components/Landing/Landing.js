import { Button, Space, Input, notification } from 'antd';
import styles from './Landing.module.css';

export default function Landing() {
  return (
    <div>
      <h1 className={styles.title}>Saver</h1>
      <p>Compare local grocers with one search</p>
      <p>Enter zip to get started</p>
      <Input></Input>
      <Button type="primary" shape="circle">a</Button>
    </div>
  );
}