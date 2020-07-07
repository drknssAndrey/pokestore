import React, { ChangeEvent, useState, MouseEvent } from "react";
import { Link } from "react-router-dom";
import Navbar from "react-bootstrap/Navbar";
import Nav from "react-bootstrap/Nav";
import Image from "react-bootstrap/Image";
import InputGroup from "react-bootstrap/InputGroup";
import FormControl from "react-bootstrap/FormControl";
import Button from "react-bootstrap/Button";
import { FaSearch } from "react-icons/fa";

import logo from "../Images/pokebola.png";

import "./menu.css";
interface Props {
  setSearchValue: (searchValue: string) => void;
}

const Header: React.FC<Props> = (props) => {
  const [search, setSearch] = useState<string>("");

  function handleSearch(event: MouseEvent<HTMLButtonElement>) {
    props.setSearchValue(search);
  }

  function handleSearchInput(event: ChangeEvent<HTMLInputElement>) {
    setSearch(event.target.value);
  }

  return (
    <Navbar
      bg="white"
      expand="lg"
      className="sticky-top border-bottom shadow-sm justify-content-between p-0"
    >
      <Navbar.Brand color="#ff0088" className="p-0 pl-3">
        <Link to="/">
          <Image src={logo} height="80" />
        </Link>
      </Navbar.Brand>
      <Nav className="ml-auto pr-3">
        <h1 className="navbar-logo" style={{ cursor: "pointer" }}>
          Pokestore
        </h1>
      </Nav>

      <Navbar.Toggle aria-controls="basic-navbar-nav" />
      <Navbar.Collapse id="basic-navbar-nav ">
        <InputGroup className="mx-auto col-sm-10 ">
          <FormControl
            placeholder="Buscar "
            value={search}
            size="lg"
            onChange={handleSearchInput}
          />
          <InputGroup.Append>
            <Button size="lg" onClick={handleSearch} color="#003A70">
              <FaSearch />
            </Button>
          </InputGroup.Append>
        </InputGroup>
      </Navbar.Collapse>
    </Navbar>
  );
};

export default Header;
