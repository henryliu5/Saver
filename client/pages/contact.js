import Layout from '../components/Layout/Layout';
import Cart from '../components/Cart/Cart';


export default function Contact(){
    return (
        <>
        <Layout content={
            <Cart></Cart>
        } menuHighlight='2'>
        </Layout>
        </>
    );
}