import { useRouter } from "next/router";
import { useQuery, gql } from "@apollo/client";

const PRODUCT = gql`
  query Product($productId: ID!) {
    product(id: $productId) {
      name
      description
      price
      imageUrl
      reviews {
        id
        body
        rating
        reviewer
      }
    }
  }
`;

const Product = () => {
  const router = useRouter();
  const { id } = router.query;
  const { data, loading, error } = useQuery(PRODUCT, {
    variables: { productId: id },
  });

  if (loading) return <h1>Loading...</h1>;
  if (error) return <h1>Some thing went wrong!</h1>;

  const { name, description, imageUrl, price, reviews } = data?.product;
  return (
    <div>
      <h1>{name.toUpperCase()}</h1>
      <h3>Description :{description}</h3>
      <p>Price :{price}</p>
      <img src={imageUrl} alt={name} />
      {reviews?.map((review: any) => {
        <li key={review.id}>
          <li>
            {review.reviewer} says: {review.body}
          </li>
          <span>stars :{review.rating}</span>
        </li>;
      })}
    </div>
  );
};

export default Product;
