import './MovieCard.css';
import { Link } from 'react-router-dom';

const POSTER = 'http://image.tmdb.org/t/p/w200'





function MovieCard(props) {

    

    return (<>
        <div className='card'>
            <Link to={['/details/', props.movie.id].join('')}>
                <img src={POSTER + props.movie.poster_path} alt=""  />
            </Link>
        </div>
    </>)
}

export default MovieCard;