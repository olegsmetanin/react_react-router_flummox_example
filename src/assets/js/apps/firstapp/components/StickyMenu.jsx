/*jshint -W018, -W040, -W064, -W083, -W086 */

import React from 'react';

let StickyMenu = React.createClass({

    componentDidMount() {
            this.calculatePositions();

            if (window) {
                window.addEventListener('scroll', this.onPageScroll);
                window.addEventListener('resize', this.onResize);
            }
        },

        componentWillUnmount() {
            if (window) {
                window.removeEventListener('scroll', this.onPageScroll);
                window.removeEventListener('resize', this.onResize);
            }
        },

        calculatePositions() {
            this._top = this.getDOMNode().parentNode.offsetTop;
            this.getDOMNode().parentNode.style.minHeight = this.getDOMNode().clientHeight + "px";
        },

        onResize(e) {
            this.calculatePositions();
            this.onPageScroll();
        },

        onPageScroll() {
            if (window.scrollY >= this._top) {
               this.getDOMNode().classList.add('sticky') 
           } else {
            this.getDOMNode().classList.remove('sticky');
           }
        },

        render() {
            return <div className={this.props.className}>{this.props.children}</div>;
        }

});

export default StickyMenu;