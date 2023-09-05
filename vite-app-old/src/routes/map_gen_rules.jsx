import ReactMarkdown from 'react-markdown';
import MapGenRulesMarkdown from '../markdown/map_gen_rules.md?raw';
import ClubsMarkdown from '../markdown/card_meanings_clubs.md?raw';
import HeartsMarkdown from '../markdown/card_meanings_hearts.md?raw';
import JokersMarkdown from '../markdown/card_meanings_jokers.md?raw';
import DiamondsMarkdown from '../markdown/card_meanings_diamonds.md?raw';
import SpadesMarkdown from '../markdown/card_meanings_spades.md?raw';
import { Link, NavLink, useParams } from 'react-router-dom';

export default function MapGenRules() {

    let { subset } = useParams();

    let page_content = MapGenRulesMarkdown

    if (subset == "hearts") {
        page_content = HeartsMarkdown
    }
    else if (subset == "diamonds") {
        page_content = DiamondsMarkdown
    }
    else if (subset == "clubs") {
        page_content = ClubsMarkdown
    }
    else if (subset == "spades") {
        page_content = SpadesMarkdown
    }
    else if (subset == "jokers") {
        page_content = JokersMarkdown
    }

    return (
        <>
            <div className="map_gen_rules_nav">
                <Link key="map_gen_rules" to={'/map_gen'} relative='path'><button>Back to Map</button></Link>{" "}
                <NavLink key="overview" to={'/map_gen/rules'} relative='path' end><button>Overview</button></NavLink>
                <NavLink key="hearts" to={'/map_gen/rules/hearts'} relative='path'><button>Hearts</button></NavLink>
                <NavLink key="diamonds" to={'/map_gen/rules/diamonds'} relative='path'><button>Diamonds</button></NavLink>
                <NavLink key="clubs" to={'/map_gen/rules/clubs'} relative='path'><button>Clubs</button></NavLink>
                <NavLink key="spades" to={'/map_gen/rules/spades'} relative='path'><button>Spades</button></NavLink>
                <NavLink key="jokers" to={'/map_gen/rules/jokers'} relative='path'><button>Jokers</button></NavLink>
            </div>
            <ReactMarkdown>{page_content}</ReactMarkdown>
        </>
    );
};

