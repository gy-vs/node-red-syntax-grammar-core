const should = require("should");
const NR_TEST_UTILS = require("nr-test-utils");
const { Group } = NR_TEST_UTILS.require("@node-red/runtime/lib/flows/Group");

describe('Group', function () {
    describe('getSetting', function () {
        it("returns group name/id", async function () {
            const group = new Group({
                getSetting: v => v+v
            }, {
                name: "g1",
                id: "group1"
            })
            await group.start()

            group.getSetting("NR_GROUP_NAME").should.equal("g1")
            group.getSetting("NR_GROUP_ID").should.equal("group1")
        })
        it("delegates to parent if not found", async function () {
            const group = new Group({
                getSetting: v => v+v
            }, {
                name: "g1",
                id: "group1"
            })
            await group.start()

            group.getSetting("123").should.equal("123123")
        })
        it("delegates to parent if explicit requested", async function () {
            const parentGroup = new Group({
                getSetting: v => v+v
            }, {
                name: "g0",
                id: "group0"
            })
            const group = new Group(parentGroup, {
                name: "g1",
                id: "group1"
            })
            await parentGroup.start()
            await group.start()

            group.getSetting("$parent.NR_GROUP_NAME").should.equal("g0")
            group.getSetting("$parent.NR_GROUP_ID").should.equal("group0")
        })
    })
    describe('start', function () {
        it("logs an error via the parent when an env var value is malformed", async function () {
            const loggedErrors = [];
            const group = new Group({
                getSetting: v => undefined,
                error: msg => loggedErrors.push(msg)
            }, {
                name: "g1",
                id: "group1",
                env: [{ name: 'INVALID', value: '{"a":1,}', type: 'json' }]
            })
            await group.start()

            loggedErrors.should.have.length(1);
            loggedErrors[0].should.startWith("Error evaluating env property 'INVALID':");
            (group.getSetting("INVALID") === undefined).should.be.true();
        })
    })
})
