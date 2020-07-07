import React, { useEffect, useState, useRef, MouseEvent } from "react";
import Container from "react-bootstrap/Container";
import Row from "react-bootstrap/Row";
import Card from "react-bootstrap/Card";
import Col from "react-bootstrap/Col";
import Pagination from "react-js-pagination";
import Spinner from "react-bootstrap/Spinner";
import ListGroup from "react-bootstrap/ListGroup";
import { Alert } from "reactstrap";

import axios from "axios";
import Header from "../Components/menu";
import { MdAddShoppingCart, MdRemoveShoppingCart } from "react-icons/md";

import Button from "react-bootstrap/Button";
import Badge from "react-bootstrap/Badge";
import "./styles.css";
import Image from "react-bootstrap/Image";

interface JsonReq {
  next: string;
  count: number;
  previous: string;
  results: {
    name: string;
    url: string;
  }[];
}

interface Pokemon {
  id: number;
  is_default: boolean;
  name: string;
  sprites: {
    front_default: string;
  };
  stats: {
    base_stat: 45;
    effort: 0;
    stat: {
      name: string;
    };
  }[];
  types: {
    type: {
      name: string;
    };
  }[];
  weight: number;
}

interface Cart {
  pokevalues: { pokemon: Pokemon; qtd: number; total: number }[];
  total: number;
}

const Home = () => {
  const [pokemons, setPokemons] = useState<Pokemon[]>([]);
  const [searchValue, setSearchValue] = useState<string>("");
  const [typeSearch, setTypeSearch] = useState<string>("");

  const [cartValues, setCartValues] = useState<Cart>();

  const [activePage, setActivePage] = useState<number>(1);
  const [totalItens, setTotalItens] = useState<number>(0);
  const [searchResults, setSearchResults] = useState<Pokemon[]>([]);

  const prevSearchValue = usePrevious(searchValue);
  const prevTypeSearch = usePrevious(typeSearch);
  const itemsPerPage = 12;

  function usePrevious(value: any) {
    const ref = useRef();
    useEffect(() => {
      if (value) ref.current = value;
    });
    return ref.current;
  }

  useEffect(() => {
    if (searchValue || typeSearch) {
      return;
    }
    if (!searchValue) {
      setSearchResults([]);
    }
    setPokemons([]);
    const indexOfLast = activePage * itemsPerPage;
    const indexOfFirst = indexOfLast - itemsPerPage;
    axios
      .get<JsonReq>(
        `https://pokeapi.co/api/v2/pokemon?limit=${itemsPerPage}&offset=${indexOfFirst}`
      )
      .then(({ data }) => {
        setTotalItens(data.count);
        const pokemonsReq = data;
        let pokemonsList: Pokemon[] = [];

        Promise.all(
          pokemonsReq.results.map((pokemon) => axios.get<Pokemon>(pokemon.url))
        ).then((results) => {
          results.map((res) => pokemonsList.push(res.data));
          setPokemons(pokemonsList);
        });
      })
      .catch((Error) => {
        console.error(Error);
      });
  }, [searchValue, activePage, typeSearch]);

  useEffect(() => {
    if (!searchValue && !typeSearch) {
      setSearchResults([]);
      return;
    }

    if (
      (searchValue === prevSearchValue || typeSearch === prevTypeSearch) &&
      searchResults.length > 0
    ) {
      const indexOfLast = activePage * itemsPerPage;
      const indexOfFirst = indexOfLast - itemsPerPage;
      setPokemons(searchResults.slice(indexOfFirst, indexOfLast));
    } else {
      setPokemons([]);
      axios
        .get<JsonReq>(`https://pokeapi.co/api/v2/pokemon?offset=0&limit=1000`)
        .then(({ data }) => {
          setActivePage(1);
          const indexOfLast = 1 * itemsPerPage;
          const indexOfFirst = indexOfLast - itemsPerPage;

          setTotalItens(data.count);
          const pokemonsReq = data.results;
          let pokemonsList: Pokemon[] = [];

          Promise.all(
            pokemonsReq.map((pokemon) => axios.get<Pokemon>(pokemon.url))
          ).then((results) => {
            results.map((res) => pokemonsList.push(res.data));
            if (searchValue)
              pokemonsList = pokemonsList.filter((pokemon) =>
                pokemon.name.includes(searchValue.toLowerCase())
              );

            if (typeSearch)
              pokemonsList = pokemonsList.filter((pokemon) =>
                pokemon.types[0].type.name.includes(typeSearch)
              );
            setSearchResults(pokemonsList);
            setTotalItens(pokemonsList.length);

            setPokemons(pokemonsList.slice(indexOfFirst, indexOfLast));
          });
        })
        .catch((Error) => {
          console.error(Error);
        });
    }
  }, [searchValue, activePage, typeSearch]); // eslint-disable-line

  const handlePageChange = (pageNumber: number) => {
    setActivePage(pageNumber);
  };

  const handleSearchByType = (event: MouseEvent<HTMLElement>, key: string) => {
    event.preventDefault();
    setTypeSearch(key);
  };

  const addToCart = (event: MouseEvent<HTMLElement>, pokemon: Pokemon) => {
    event.preventDefault();
    let pokevalues;
    let newItem = true;
    if (!cartValues) pokevalues = [{ pokemon: pokemon, qtd: 0, total: 0 }];
    else pokevalues = cartValues.pokevalues;

    pokevalues.map((pokevalue) => {
      if (pokevalue.pokemon.id === pokemon.id) {
        newItem = false;
        pokevalue.qtd++;
        pokevalue.total =
          ((pokevalue.pokemon.weight + 13.99) / 5) * pokevalue.qtd;
      }
      return pokevalue;
    });
    if (newItem)
      pokevalues.push({ pokemon, qtd: 1, total: (pokemon.weight + 13.99) / 5 });
    const total: number = pokevalues.reduce((prev, cur) => {
      return prev + cur.total;
    }, 0);

    setCartValues({ pokevalues, total });
  };

  const removeFromCart = async (pokemon: Pokemon) => {
    if (cartValues) {
      let pokevalues = cartValues.pokevalues;
      pokevalues.map((pokevalue) => {
        if (pokevalue.pokemon.id === pokemon.id) {
          pokevalue.qtd--;
          pokevalue.total =
            ((pokevalue.pokemon.weight + 13.99) / 5) * pokevalue.qtd;
        }
        return pokevalue;
      });
      pokevalues = pokevalues.filter((pokevalue) => pokevalue.qtd !== 0);
      const total: number = pokevalues.reduce((prev, cur) => {
        return prev + cur.total;
      }, 0);
      setCartValues({ pokevalues, total });
    }
  };

  const [show, setShow] = useState(false);
  const handleClose = () => {
    setCartValues(undefined);
    setShow(false);
  };
  const handleShow = () => setShow(true);
  if (show) {
    setTimeout(() => {
      setShow(false);
      setCartValues(undefined);
    }, 3000);
  }
  return (
    <>
      <Header setSearchValue={setSearchValue} />

      <Alert color="success" isOpen={show}>
        Compra realizada com sucesso!
      </Alert>
      <Container fluid>
        <div className="float-right my-3 cart">
          <Card className="p-1">
            <ListGroup variant="flush">
              <ListGroup.Item className="mx-auto p-1 carrinho">
                <b>
                  <h2>Carrinho</h2>
                </b>
              </ListGroup.Item>
              {cartValues ? (
                cartValues.pokevalues.map((pokevalue) => (
                  <ListGroup.Item
                    key={pokevalue.pokemon.id}
                    className="align-middle p-1 carrinho"
                  >
                    <span>{pokevalue.qtd + " "}</span>
                    <span className="text-capitalize">
                      {pokevalue.pokemon.name}
                      <span className="float-right align-top">
                        <span>= {pokevalue.total.toFixed(2)}</span>
                        <Button
                          className="px-1 pb-1 pt-0 m-0"
                          onClick={() => removeFromCart(pokevalue.pokemon)}
                          variant={"link"}
                        >
                          <MdRemoveShoppingCart className="p-0" size={15} />
                        </Button>
                      </span>
                    </span>
                  </ListGroup.Item>
                ))
              ) : (
                <></>
              )}
              <ListGroup.Item className="p-1 carrinho">
                Total{" "}
                {cartValues ? (
                  <span className="float-right">
                    R$ {cartValues.total.toFixed(2)}
                  </span>
                ) : (
                  <></>
                )}
              </ListGroup.Item>
              <ListGroup.Item className="p-1 pt-2">
                <Button variant="info" onClick={handleShow} block>
                  <MdAddShoppingCart></MdAddShoppingCart>
                </Button>
              </ListGroup.Item>
            </ListGroup>
          </Card>
        </div>

        <Container>
          <Row className="mt-2 pr-3">
            {pokemons.length > 0 ? (
              pokemons.map((pokemon) => (
                <span
                  key={pokemon.id}
                  className="col-sm-6 col-md-2 col-lg-3 my-1 pr-0"
                >
                  <Card
                    className={`h-100 card-link pokecard  ${pokemon.types[0].type.name}`}
                  >
                    <Card.Img
                      className="pr-1 pl-1"
                      variant="top"
                      src={`https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${pokemon.id}.png`}
                    />
                    <span
                      className="text-capitalize m-0 h5"
                      style={{ textAlign: "center" }}
                    >
                      {pokemon.name}
                    </span>
                    <div className="tipo">
                      <span className="float-left">
                        {pokemon.types.map((type) => (
                          <Badge
                            key={type.type.name}
                            className={type.type.name}
                          >
                            <span> {type.type.name} </span>
                          </Badge>
                        ))}
                      </span>
                    </div>
                    <span className="float-left pt-3 price  ">
                      R$ {((pokemon.weight + 13.99) / 5).toFixed(2)}
                    </span>

                    <Card.Body className="py-0 px-1">
                      <Card.Text>
                        <span className="float-right my-1 cart-add">
                          <Button className="py-1 px-2 ">
                            <MdAddShoppingCart size={25} />
                          </Button>
                        </span>
                      </Card.Text>
                      <a
                        id="cardlink-{pokemon.id}"
                        href="/"
                        onClick={(event) => addToCart(event, pokemon)}
                        className="stretched-link "
                      >
                        {null}
                      </a>
                    </Card.Body>
                  </Card>
                </span>
              ))
            ) : (
              <Col className="d-flex justify-content-center my-3">
                <Spinner animation="border" />
              </Col>
            )}
          </Row>
          <span className="justify-content-center d-flex">
            <Pagination
              itemClass="page-item"
              linkClass="page-link"
              activePage={activePage}
              itemsCountPerPage={itemsPerPage}
              totalItemsCount={totalItens}
              hideNavigation
              onChange={handlePageChange}
            />
          </span>
        </Container>
      </Container>
    </>
  );
};

export default Home;
