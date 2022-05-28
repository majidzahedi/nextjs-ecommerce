import { useQuery, gql, NetworkStatus } from "@apollo/client";
import Link from "next/link";

const PRODUCTS = gql`
  query Products($first: Int, $after: String) {
    products(first: $first, after: $after) {
      pageInfo {
        endCursor
        hasNextPage
      }
      edges {
        cursor
        node {
          id
          name
          description
          price
          imageUrl
          reviews {
            id
            rating
            body
            reviewer
          }
        }
      }
    }
  }
`;

const Product = () => {
  const { data, loading, networkStatus, error, fetchMore } = useQuery(
    PRODUCTS,
    {
      variables: { first: 8 },
      notifyOnNetworkStatusChange: true,
    }
  );

  if (networkStatus === NetworkStatus.loading) return <h1>Loading...</h1>;
  if (error) return <h1>Some thing went wrong!</h1>;

  const { endCursor, hasNextPage } = data?.products.pageInfo;
  return (
    <div style={{ textAlign: "center" }}>
      <h1>Products</h1>
      <div
        style={{
          display: "flex",
          gap: "2rem",
          textAlign: "center",
          justifyContent: "center",
          flexWrap: "wrap",
        }}
      >
        {data?.products.edges.map(({ node }, i) => (
          <div style={{ flexGrow: "1", width: "20%" }} key={i}>
            <img src={node.imageUrl} alt={node.name} />
            <Link href={`/product/${node.id}`}>
              <p>name:{node.name}</p>
            </Link>
            <h4>price:{node.price}</h4>
          </div>
        ))}
      </div>
      {loading && <h1>Loading...</h1>}
      {hasNextPage ? (
        <button
          onClick={() => {
            fetchMore({
              variables: { after: endCursor },
              updateQuery: (prevResult, { fetchMoreResult }) => {
                fetchMoreResult.products.edges = [
                  ...prevResult.products.edges,
                  ...fetchMoreResult.products.edges,
                ];
                return fetchMoreResult;
              },
            });
          }}
        >
          more
        </button>
      ) : (
        <p className="my-10 text-center font-medium">You've reached the end!</p>
      )}
    </div>
  );
};

export default Product;
