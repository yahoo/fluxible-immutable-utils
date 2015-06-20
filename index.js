module.exports = {
    ComponentMixin: require('./mixins/ImmutableMixin'),
    createImmutableMixin: require('./lib/createImmutableMixin'),
    createImmutableStore: require('./lib/createImmutableStore'),
    createImmutableContainer: require('./lib/createImmutableContainer'),
    ImmutableStore: require('./lib/ImmutableStore')
};
