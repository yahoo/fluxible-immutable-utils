module.exports = {
    ComponentMixin: require('./mixins/ImmutableMixin'),
    createImmutableMixin: require('./lib/createImmutableMixin'),
    createImmutableContainer: require('./lib/createImmutableContainer'),
    createImmutableStore: require('./lib/createImmutableStore'),
    ImmutableStore: require('./lib/ImmutableStore')
};
