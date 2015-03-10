describe('Promise', function () {
    describe('.then()', () => {
        it('is .map()', () => {
            return Promise.resolve('first')
                .then(v => 'second')
                .should.be.finally.equal('second');

        })
        it('is .flatMap()', () => {
            return Promise.resolve('first')
                .then(v => Promise.resolve('second'))
                .should.be.finally.equal('second')
                .and.be.a.String;
        })
    })
})