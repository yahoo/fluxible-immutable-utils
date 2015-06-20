module.exports = {
    ComponentMixin: require('./mixins/ImmutableMixin'),
    createImmutableMixin: require('./lib/createImmutableMixin'),
    createImmutableStore: require('./lib/createImmutableStore'),
    ImmutableStore: require('./lib/ImmutableStore')
};
