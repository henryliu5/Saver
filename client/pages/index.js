import Layout from '../components/Layout'
import Home from '../components/Home'

export default function Index(){
  return(
    <Layout content={<Home/>} menuHighlight='1'></Layout>
  )
}