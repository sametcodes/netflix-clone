import React, { Component } from 'react';
import { NavLink } from 'react-router-dom';
import _ from 'lodash';
import { withRouter } from 'react-router-dom';
import axios from '../axios-movies';
import Movie from '../components/Movie/Movie';

import SearchLogo from '../static/images/search-icon.svg';
import NetflixLogo from '../static/images/Netflix_Logo_RGB.png';
import BellLogo from '../static/images/bell-logo.svg';
import DropdownArrow from '../static/images/drop-down-arrow.svg';
import DropdownContent from "../components/DropdownContent";

class Navbar extends Component {
  constructor(props) {
    super(props)
    this.state = {
      scrolling: false,
      movieList: [],
      userInput: ''
    }
    // use to debounce api call
    this.makeAipCall = _.debounce(this.makeAipCall, 1000)
  }

  componentDidMount() {
    window.addEventListener('scroll', this.handleScroll);
  }

  componentWillUnmount() {
    window.removeEventListener('scroll', this.handleScroll);
  }

  /** changes the scrolling state depending on the Y-position */
  handleScroll = (event) => {
    if (window.scrollY === 0) {
      this.setState({ scrolling: false });
    }
    else if (window.scrollY > 50) {
      this.setState({ scrolling: true });
    }
  }

  onChange = async (event) => {
    await this.setState({ userInput: event.target.value })
    const { userInput } = this.state

    await this.makeAipCall(userInput);
  }

  /** Make API call as soon as the user starts typing.  */
  makeAipCall = async (searchItem) => {
    if (searchItem.length === 0) {
      this.props.history.push('/')
      return
    }

    const url = `/search/multi?api_key=${process.env.API_KEY}&language=en-US&include_adult=false&query=${searchItem}`;
    const response = await axios.get(url);
    const results = response.data.results;
    let movieImageUrl;
    /** Will hold all our movies Components */
    let movieRows = [];

    /** Loop through all the movies */
    results.forEach((movie) => {
      /** Manually build our image url and set it on the Movie component. */
      if (movie.poster_path !== null && movie.media_type !== "person") {
        movieImageUrl = "https://image.tmdb.org/t/p/w500" + movie.poster_path;

        /** Set the movie object to our Movie component */
        const movieComponent = <Movie
          movieDetails={() => this.selectMovieHandler(movie)}
          key={movie.id}
          movieImage={movieImageUrl}
          movie={movie} />

        /** Push our movie component to our movieRows array */
        movieRows.push(movieComponent);
      }
    })
    /** Set our MovieList array to the movieRows array */
    await this.setState({ movieList: movieRows });
    this.props.history.push({
      pathname: '/search',
      movieRows: this.state.movieList,
      userInput: searchItem
    });
  }

  onLogoClick = () => {
    // reset state
    this.setState({ userInput: '' })
  }

  render() {
    const { scrolling } = this.state;

    return (
      <nav className={"navigation " + (scrolling ? "black" : "")} >
        <ul className="navigation__container">
          <NavLink to="/" onClick={() => this.onLogoClick()}>
            <img className="navigation__container--logo" src={NetflixLogo} alt="" />
          </NavLink>
          <DropdownArrow className="navigation__container--downArrow-2"></DropdownArrow>
          <div className="navigation__container-link pseudo-link">Home</div>
          <div className="navigation__container-link pseudo-link">TV Shows</div>
          <div className="navigation__container-link pseudo-link">Movies</div>
          <div className="navigation__container-link pseudo-link">Recently Added</div>
          <div className="navigation__container-link pseudo-link">My List</div>

          <div className="navigation__container--left">
            <SearchLogo className="logo" />
            <input
              value={this.state.userInput}
              onChange={() => this.onChange(event)}
              className="navigation__container--left__input"
              type="text"
              placeholder="Title, genres, people" />
          </div>

          <div className="navigation__container-link pseudo-link">KIDS</div>
          <div className="navigation__container-link pseudo-link">DVD</div>
          <BellLogo className="navigation__container--bellLogo" />

          <DropdownContent />
          <DropdownArrow className="navigation__container--downArrow" />
        </ul>
      </nav>
    )
  }
}

export default withRouter(Navbar); 