import React, {Component} from 'react';
import axios from 'axios';

class Fib extends Component {
    state = {
        seenIndexes: [],
        values: {},
        index: ''
    };

    componentDidMount() {
        this.fetchValues();
        this.fetchIndexes();
    }

    async fetchValues() {
        try {
            const values = await axios.get('/api/values/current');
            console.log('fetch values');
            console.log(values);
            this.setState({values: values.data});
        } catch (e) {
            console.log(e);
        }
    }

    async fetchIndexes() {
        const seenIndexes = await axios.get('/api/values/all');
        console.log('fetch indexes');
        console.log(seenIndexes);
        this.setState({seenIndexes: seenIndexes.data});
    }

    handleSubmit = async (event) => {
        event.preventDefault();
        await axios.post('/api/values', {
            index: this.state.index
        });
        this.setState({index: ''});
    };

    renderSeenIndexes() {
        return this
            .state
            .seenIndexes
            .map(({number}) => number)
            .join(', ');
    }

    renderValues() {
        const entries = [];

        for (const key in this.state.values) {
            entries.push(
                <div key={key}>
                    For index {key} I calculated {this.state.values[key]}
                </div>
            );
        }

        return entries;
    }

    render() {
        return (
            <div>
                <form onSubmit={this.handleSubmit}>
                    <label>Enter your index:</label>
                    <input
                        value={this.state.index}
                        onChange={event => this.setState({index: event.target.value})}
                    />
                    <button>Submit</button>
                </form>

                <h3>Indexes i have seen:</h3>
                {this.renderSeenIndexes()}

                <h3>Calculated values:</h3>
                {this.renderValues()}
            </div>
        );
    }
}

export default Fib;