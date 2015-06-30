module.exports = {
    ComponentMixin: require('./mixins/ImmutableMixin'),
    createImmutableMixin: require('./lib/createImmutableMixin'),
    createImmutableContainer: require('./lib/createImmutableContainer'),
    ImmutableStore: require('./dist/ImmutableStore')
};
