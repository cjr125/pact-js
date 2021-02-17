"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
/* tslint:disable:no-unused-expression no-empty object-literal-sort-keys */
var expect = require("chai").expect;
var matchers_1 = require("./matchers");
describe("Matcher", function () {
    describe("#validateExample", function () {
        describe("when given a valid regex", function () {
            describe("and a matching example", function () {
                it("returns true", function () {
                    expect(matchers_1.validateExample("2010-01-01", matchers_1.ISO8601_DATE_FORMAT)).to.eql(true);
                });
            });
            describe("and a failing example", function () {
                it("returns false", function () {
                    expect(matchers_1.validateExample("not a date", matchers_1.ISO8601_DATE_FORMAT)).to.eql(false);
                });
            });
        });
        describe("when given an invalid regex", function () {
            it("returns an error", function () {
                expect(function () {
                    matchers_1.validateExample("", "abc(");
                }).to.throw(Error);
            });
        });
    });
    describe("#term", function () {
        describe("when given a valid regular expression and example", function () {
            it("returns a serialized Ruby object", function () {
                var expected = {
                    data: {
                        generate: "myawesomeword",
                        matcher: {
                            json_class: "Regexp",
                            o: 0,
                            s: "\\w+",
                        },
                    },
                    json_class: "Pact::Term",
                };
                var match = matchers_1.term({
                    generate: "myawesomeword",
                    matcher: "\\w+",
                });
                expect(JSON.stringify(match)).to.deep.include(JSON.stringify(expected));
            });
        });
        describe("when not provided with a valid expression", function () {
            var createTheTerm = function (badArg) {
                return function () {
                    matchers_1.term(badArg);
                };
            };
            describe("when no term is provided", function () {
                it("throws an Error", function () {
                    expect(createTheTerm.call({})).to.throw(Error);
                });
            });
            describe("when an invalid term is provided", function () {
                it("throws an Error", function () {
                    expect(createTheTerm({})).to.throw(Error);
                    expect(createTheTerm("")).to.throw(Error);
                    expect(createTheTerm({ generate: "foo" })).to.throw(Error);
                    expect(createTheTerm({ matcher: "\\w+" })).to.throw(Error);
                });
            });
        });
        describe("when given an example that doesn't match the regular expression", function () {
            it("fails with an error", function () {
                expect(function () {
                    matchers_1.term({
                        generate: "abc",
                        matcher: matchers_1.ISO8601_DATE_FORMAT,
                    });
                }).to.throw(Error);
            });
        });
    });
    describe("#somethingLike", function () {
        describe("when provided a value", function () {
            it("returns a serialized Ruby object", function () {
                var expected = {
                    contents: "myspecialvalue",
                    json_class: "Pact::SomethingLike",
                };
                var match = matchers_1.somethingLike("myspecialvalue");
                expect(JSON.stringify(match)).to.deep.include(JSON.stringify(expected));
            });
        });
        describe("when not provided with a valid value", function () {
            var createTheValue = function (badArg) {
                return function () {
                    matchers_1.somethingLike(badArg);
                };
            };
            describe("when no value is provided", function () {
                it("`throws an Error", function () {
                    expect(createTheValue.call({})).to.throw(Error);
                });
            });
            describe("when an invalid value is provided", function () {
                it("throws an Error", function () {
                    expect(createTheValue(undefined)).to.throw(Error);
                    expect(createTheValue(function () { })).to.throw(Error);
                });
            });
        });
    });
    describe("#eachLike", function () {
        describe("when content is null", function () {
            it("provides null as contents", function () {
                var expected = {
                    contents: null,
                    json_class: "Pact::ArrayLike",
                    min: 1,
                };
                var match = matchers_1.eachLike(null, { min: 1 });
                expect(JSON.stringify(match)).to.deep.include(JSON.stringify(expected));
            });
        });
        describe("when an object is provided", function () {
            it("provides the object as contents", function () {
                var expected = {
                    contents: { a: 1 },
                    json_class: "Pact::ArrayLike",
                    min: 1,
                };
                var match = matchers_1.eachLike({ a: 1 }, { min: 1 });
                expect(JSON.stringify(match)).to.deep.include(JSON.stringify(expected));
            });
        });
        describe("when object.min is invalid", function () {
            it("throws an Error message", function () {
                expect(function () {
                    matchers_1.eachLike({ a: 1 }, { min: 0 });
                }).to.throw(Error);
            });
        });
        describe("when an array is provided", function () {
            it("provides the array as contents", function () {
                var expected = {
                    contents: [1, 2, 3],
                    json_class: "Pact::ArrayLike",
                    min: 1,
                };
                var match = matchers_1.eachLike([1, 2, 3], { min: 1 });
                expect(JSON.stringify(match)).to.deep.include(JSON.stringify(expected));
            });
        });
        describe("when a value is provided", function () {
            it("adds the value in contents", function () {
                var expected = {
                    contents: "test",
                    json_class: "Pact::ArrayLike",
                    min: 1,
                };
                var match = matchers_1.eachLike("test", { min: 1 });
                expect(JSON.stringify(match)).to.deep.include(JSON.stringify(expected));
            });
        });
        describe("when the content has Pact.Macters", function () {
            describe("of type somethingLike", function () {
                it("nests somethingLike correctly", function () {
                    var expected = {
                        contents: {
                            id: {
                                contents: 10,
                                json_class: "Pact::SomethingLike",
                            },
                        },
                        json_class: "Pact::ArrayLike",
                        min: 1,
                    };
                    var match = matchers_1.eachLike({ id: matchers_1.somethingLike(10) }, { min: 1 });
                    expect(JSON.stringify(match)).to.deep.include(JSON.stringify(expected));
                });
            });
            describe("of type term", function () {
                it("nests term correctly", function () {
                    var expected = {
                        contents: {
                            colour: {
                                data: {
                                    generate: "red",
                                    matcher: {
                                        json_class: "Regexp",
                                        o: 0,
                                        s: "red|green",
                                    },
                                },
                                json_class: "Pact::Term",
                            },
                        },
                        json_class: "Pact::ArrayLike",
                        min: 1,
                    };
                    var match = matchers_1.eachLike({
                        colour: matchers_1.term({
                            generate: "red",
                            matcher: "red|green",
                        }),
                    }, { min: 1 });
                    expect(JSON.stringify(match)).to.deep.include(JSON.stringify(expected));
                });
            });
            describe("of type eachLike", function () {
                it("nests eachlike in contents", function () {
                    var expected = {
                        contents: {
                            contents: "blue",
                            json_class: "Pact::ArrayLike",
                            min: 1,
                        },
                        json_class: "Pact::ArrayLike",
                        min: 1,
                    };
                    var match = matchers_1.eachLike(matchers_1.eachLike("blue", { min: 1 }), { min: 1 });
                    expect(JSON.stringify(match)).to.deep.include(JSON.stringify(expected));
                });
            });
            describe("complex object with multiple Pact.Matchers", function () {
                it("nests objects correctly", function () {
                    var expected = {
                        contents: {
                            contents: {
                                colour: {
                                    data: {
                                        generate: "red",
                                        matcher: {
                                            json_class: "Regexp",
                                            o: 0,
                                            s: "red|green|blue",
                                        },
                                    },
                                    json_class: "Pact::Term",
                                },
                                size: {
                                    contents: 10,
                                    json_class: "Pact::SomethingLike",
                                },
                                tag: {
                                    contents: [
                                        {
                                            contents: "jumper",
                                            json_class: "Pact::SomethingLike",
                                        },
                                        {
                                            contents: "shirt",
                                            json_class: "Pact::SomethingLike",
                                        },
                                    ],
                                    json_class: "Pact::ArrayLike",
                                    min: 2,
                                },
                            },
                            json_class: "Pact::ArrayLike",
                            min: 1,
                        },
                        json_class: "Pact::ArrayLike",
                        min: 1,
                    };
                    var match = matchers_1.eachLike(matchers_1.eachLike({
                        colour: matchers_1.term({ generate: "red", matcher: "red|green|blue" }),
                        size: matchers_1.somethingLike(10),
                        tag: matchers_1.eachLike([matchers_1.somethingLike("jumper"), matchers_1.somethingLike("shirt")], { min: 2 }),
                    }, { min: 1 }), { min: 1 });
                    expect(JSON.stringify(match)).to.deep.include(JSON.stringify(expected));
                });
            });
        });
        describe("When no options.min is not provided", function () {
            it("defaults to a min of 1", function () {
                var expected = {
                    contents: { a: 1 },
                    json_class: "Pact::ArrayLike",
                    min: 1,
                };
                var match = matchers_1.eachLike({ a: 1 });
                expect(JSON.stringify(match)).to.deep.include(JSON.stringify(expected));
            });
        });
        describe("When a options.min is provided", function () {
            it("provides the object as contents", function () {
                var expected = {
                    contents: { a: 1 },
                    json_class: "Pact::ArrayLike",
                    min: 3,
                };
                var match = matchers_1.eachLike({ a: 1 }, { min: 3 });
                expect(JSON.stringify(match)).to.deep.include(JSON.stringify(expected));
            });
        });
    });
    describe("#email", function () {
        describe("when given a valid Email address", function () {
            it("creates a valid matcher", function () {
                expect(matchers_1.email("hello@world.com")).to.be.an("object");
                expect(matchers_1.email("hello@world.com.au")).to.be.an("object");
                expect(matchers_1.email("hello@a.co")).to.be.an("object");
                expect(matchers_1.email()).to.be.an("object");
            });
        });
        describe("when given an invalid Email address", function () {
            it("returns an error", function () {
                expect(function () {
                    matchers_1.email("hello.world.c");
                }).to.throw(Error);
            });
        });
    });
    describe("#uuid", function () {
        describe("when given a valid UUID", function () {
            it("creates a valid matcher", function () {
                expect(matchers_1.uuid("ce118b6e-d8e1-11e7-9296-cec278b6b50a")).to.be.an("object");
                expect(matchers_1.uuid()).to.be.an("object");
            });
        });
        describe("when given an invalid UUID", function () {
            it("returns an error", function () {
                expect(function () {
                    matchers_1.uuid("abc");
                }).to.throw(Error);
            });
        });
    });
    describe("#ipv4Address", function () {
        describe("when given a valid ipv4Address", function () {
            it("creates a valid matcher", function () {
                expect(matchers_1.ipv4Address("127.0.0.1")).to.be.an("object");
                expect(matchers_1.ipv4Address()).to.be.an("object");
            });
        });
        describe("when given an invalid ipv4Address", function () {
            it("returns an error", function () {
                expect(function () {
                    matchers_1.ipv4Address("abc");
                }).to.throw(Error);
            });
        });
    });
    describe("#ipv6Address", function () {
        describe("when given a valid ipv6Address", function () {
            it("creates a valid matcher", function () {
                expect(matchers_1.ipv6Address("::1")).to.be.an("object");
                expect(matchers_1.ipv6Address("2001:0db8:85a3:0000:0000:8a2e:0370:7334")).to.be.an("object");
                expect(matchers_1.ipv6Address()).to.be.an("object");
            });
        });
        describe("when given an invalid ipv6Address", function () {
            it("returns an error", function () {
                expect(function () {
                    matchers_1.ipv6Address("abc");
                }).to.throw(Error);
            });
        });
    });
    describe("#hexadecimal", function () {
        describe("when given a valid hexadecimal", function () {
            it("creates a valid matcher", function () {
                expect(matchers_1.hexadecimal("6F")).to.be.an("object");
                expect(matchers_1.hexadecimal()).to.be.an("object");
            });
        });
        describe("when given an invalid hexadecimal", function () {
            it("returns an error", function () {
                expect(function () {
                    matchers_1.hexadecimal("x1");
                }).to.throw(Error);
            });
        });
    });
    describe("#boolean", function () {
        describe("when used it should create a JSON object", function () {
            it("creates a valid matcher", function () {
                expect(matchers_1.boolean()).to.be.an("object");
                expect(matchers_1.boolean().contents).to.equal(true);
            });
            it("sets value=false", function () {
                expect(matchers_1.boolean(false)).to.be.an("object");
                expect(matchers_1.boolean(false).contents).to.equal(false);
            });
            it("sets value=true", function () {
                expect(matchers_1.boolean(true)).to.be.an("object");
                expect(matchers_1.boolean(true).contents).to.equal(true);
            });
        });
    });
    describe("#string", function () {
        describe("when given a valid string", function () {
            it("creates a valid matcher", function () {
                expect(matchers_1.string("test")).to.be.an("object");
                expect(matchers_1.string()).to.be.an("object");
                expect(matchers_1.string("test").contents).to.equal("test");
            });
        });
    });
    describe("#decimal", function () {
        describe("when given a valid decimal", function () {
            it("creates a valid matcher", function () {
                expect(matchers_1.decimal(10.1)).to.be.an("object");
                expect(matchers_1.decimal()).to.be.an("object");
                expect(matchers_1.decimal(0.0).contents).to.equal(0.0);
            });
        });
    });
    describe("#integer", function () {
        describe("when given a valid integer", function () {
            it("creates a valid matcher", function () {
                expect(matchers_1.integer(10)).to.be.an("object");
                expect(matchers_1.integer()).to.be.an("object");
                expect(matchers_1.integer(0).contents).to.equal(0);
            });
        });
    });
    describe("Date Matchers", function () {
        describe("#rfc3339Timestamp", function () {
            describe("when given a valid rfc3339Timestamp", function () {
                it("creates a valid matcher", function () {
                    expect(matchers_1.rfc3339Timestamp("Mon, 31 Oct 2016 15:21:41 -0400")).to.be.an("object");
                    expect(matchers_1.rfc3339Timestamp()).to.be.an("object");
                });
            });
            describe("when given an invalid rfc3339Timestamp", function () {
                it("returns an error", function () {
                    expect(function () {
                        matchers_1.rfc3339Timestamp("abc");
                    }).to.throw(Error);
                });
            });
        });
        describe("#iso8601Time", function () {
            describe("when given a valid iso8601Time", function () {
                it("creates a valid matcher", function () {
                    expect(matchers_1.iso8601Time("T22:44:30.652Z")).to.be.an("object");
                    expect(matchers_1.iso8601Time()).to.be.an("object");
                });
            });
            describe("when given an invalid iso8601Time", function () {
                it("returns an error", function () {
                    expect(function () {
                        matchers_1.iso8601Time("abc");
                    }).to.throw(Error);
                });
            });
        });
        describe("#iso8601Date", function () {
            describe("when given a valid iso8601Date", function () {
                it("creates a valid matcher", function () {
                    expect(matchers_1.iso8601Date("2017-12-05")).to.be.an("object");
                    expect(matchers_1.iso8601Date()).to.be.an("object");
                });
            });
            describe("when given an invalid iso8601Date", function () {
                it("returns an error", function () {
                    expect(function () {
                        matchers_1.iso8601Date("abc");
                    }).to.throw(Error);
                });
            });
        });
        describe("#iso8601DateTime", function () {
            describe("when given a valid iso8601DateTime", function () {
                it("creates a valid matcher", function () {
                    expect(matchers_1.iso8601DateTime("2015-08-06T16:53:10+01:00")).to.be.an("object");
                    expect(matchers_1.iso8601DateTime()).to.be.an("object");
                });
            });
            describe("when given an invalid iso8601DateTime", function () {
                it("returns an error", function () {
                    expect(function () {
                        matchers_1.iso8601DateTime("abc");
                    }).to.throw(Error);
                });
            });
        });
        describe("#iso8601DateTimeWithMillis", function () {
            describe("when given a valid iso8601DateTimeWithMillis", function () {
                it("creates a valid matcher", function () {
                    expect(matchers_1.iso8601DateTimeWithMillis("2015-08-06T16:53:10.123+01:00")).to.be.an("object");
                    expect(matchers_1.iso8601DateTimeWithMillis("2015-08-06T16:53:10.537357Z")).to.be.an("object");
                    expect(matchers_1.iso8601DateTimeWithMillis("2020-12-10T09:01:29.06Z")).to.be.an("object");
                    expect(matchers_1.iso8601DateTimeWithMillis("2020-12-10T09:01:29.1Z")).to.be.an("object");
                    expect(matchers_1.iso8601DateTimeWithMillis()).to.be.an("object");
                });
            });
            describe("when given an invalid iso8601DateTimeWithMillis", function () {
                it("returns an error", function () {
                    expect(function () {
                        matchers_1.iso8601DateTimeWithMillis("abc");
                    }).to.throw(Error);
                });
            });
        });
        describe("#extractPayload", function () {
            describe("when given an object with no matchers", function () {
                var object = {
                    some: "data",
                    more: "strings",
                    an: ["array"],
                    someObject: {
                        withData: true,
                        withNumber: 1,
                    },
                };
                it("returns just that object", function () {
                    expect(matchers_1.extractPayload(object)).to.deep.eql(object);
                });
            });
            describe("when given an object with some matchers", function () {
                var someMatchers = {
                    some: matchers_1.somethingLike("data"),
                    more: "strings",
                    an: ["array"],
                    another: matchers_1.eachLike("this"),
                    someObject: {
                        withData: matchers_1.somethingLike(true),
                        withTerm: matchers_1.term({ generate: "this", matcher: "this|that" }),
                        withNumber: 1,
                        withAnotherNumber: matchers_1.somethingLike(2),
                    },
                };
                var expected = {
                    some: "data",
                    more: "strings",
                    an: ["array"],
                    another: ["this"],
                    someObject: {
                        withData: true,
                        withTerm: "this",
                        withNumber: 1,
                        withAnotherNumber: 2,
                    },
                };
                it("returns without matching guff", function () {
                    expect(matchers_1.extractPayload(someMatchers)).to.deep.eql(expected);
                });
            });
            describe("when given a simple matcher", function () {
                it("removes all matching guff", function () {
                    var expected = "myawesomeword";
                    var matcher = matchers_1.term({
                        generate: "myawesomeword",
                        matcher: "\\w+",
                    });
                    expect(matchers_1.isMatcher(matcher)).to.eq(true);
                    expect(matchers_1.extractPayload(matcher)).to.eql(expected);
                });
            });
            describe("when given a complex nested object with matchers", function () {
                it("removes all matching guff", function () {
                    var o = matchers_1.somethingLike({
                        stringMatcher: {
                            awesomeSetting: matchers_1.somethingLike("a string"),
                        },
                        anotherStringMatcher: {
                            nestedSetting: {
                                anotherStringMatcherSubSetting: matchers_1.somethingLike(true),
                            },
                            anotherSetting: matchers_1.term({ generate: "this", matcher: "this|that" }),
                        },
                        arrayMatcher: {
                            lotsOfValues: matchers_1.eachLike("useful", { min: 3 }),
                        },
                        arrayOfMatchers: {
                            lotsOfValues: matchers_1.eachLike({
                                foo: "bar",
                                baz: matchers_1.somethingLike("bat"),
                            }, { min: 3 }),
                        },
                    });
                    var expected = {
                        stringMatcher: {
                            awesomeSetting: "a string",
                        },
                        anotherStringMatcher: {
                            nestedSetting: {
                                anotherStringMatcherSubSetting: true,
                            },
                            anotherSetting: "this",
                        },
                        arrayMatcher: {
                            lotsOfValues: ["useful", "useful", "useful"],
                        },
                        arrayOfMatchers: {
                            lotsOfValues: [
                                {
                                    baz: "bat",
                                    foo: "bar",
                                },
                                {
                                    baz: "bat",
                                    foo: "bar",
                                },
                                {
                                    baz: "bat",
                                    foo: "bar",
                                },
                            ],
                        },
                    };
                    expect(matchers_1.extractPayload(o)).to.deep.eql(expected);
                });
            });
        });
    });
});
//# sourceMappingURL=matchers.spec.js.map