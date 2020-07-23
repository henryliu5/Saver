import Layout from '../components/Layout/Layout'
import Home from '../components/Home/Home'

export default function Index(){
  return(
    <Layout content={<Home/>} menuHighlight='1'></Layout>
  )
}