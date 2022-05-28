import { useQuery } from "@apollo/client";
import { gql } from "apollo-server-micro";
import type { NextPage } from "next";

const Hello = gql`
  query hello {
    helloWorld
  }
`;

const Home: NextPage = () => {
  const { data, error, loading } = useQuery(Hello);

  if (loading) return <h1>loading....</h1>;
  if (error) return <h1>What Happend!</h1>;

  return (
    <div>
      <h1>{data && data.helloWorld}</h1>
    </div>
  );
};

export default Home;
