# Complish
*A controlled natural language partly inspired by Inform 7*

Go read [Defining 'Declarative'](https://awelonblue.wordpress.com/2012/01/12/defining-declarative/) at David Barbour's blog Awelon Blue. He explains what a declarative programming language should be better than I can. 

I also became fond of Inform 7's English-like syntax.  It's hard to learn at first (counter-intuitively) but seeing code you wrote a year ago, you immediately see what your intent was with the code.  Since 90% of coding is reading code rather than writing it, English-like syntax has a role to play in future programming languages. 

English grammar and programming language grammer have some basic similarities. 

* Nouns are objects
* Verbs are functions
* Antecendents are variables (pronouns, plus constructions of the form `the` followed by a common noun)
* Plurals are lists/arrays/collections
* Higher-order functions: the function being passed is a gerundial phrase. 
* All natural languages specify which of a verb's "slots" each noun goes.  Either by placement (i.e., the subject always precedes the verb in English) or by inflection (usually a suffix on each noun to indicate if it's subject or direct object, etc.)  So passing nouns to verbs is no problem.
* Prepositions allow for more parameters than are normal. (English verbs have three slots, Russian has four. The fourth is, in English, usually specified by adding a 'with' prepositional phrase.)
* Indefinite noun phrases are parameters; definite noun phrases are the arguments
* Partially applied function is a gerundial phrase with both definite and indefinite noun phrases
* Relative clauses find/select from a list, like SQL or Prolog: "the car which (criteria...)"
* Imperatives change state

There's also some differences.

* English doesn't nest more than a couple levels deep. Functional languages *hate* this!
* Defining a verb is very rare in English while it comprises the majority of coding. 
* Anonymous functions, where you define a new function at the same place you then use it, doesn't seem to fly in English. (And since lambdas are anonymous closures, well...)
* No single paradigm is a perfect fit: OO, functional, imperative, rule, constraint
* Indistinguishable definite & indefinite gerundial phrases with zero parameters, since the article on the noun phrases decide it rather than a verb suffix (like empty parenthesis)
* Tense and Gender seem to have little use. Aspect seems promising but English conflates the continuous with the progressive.

Anyway, I'd like to marry Barbour's "declarative" with an English-like syntax.  

Other stuff.

* I'd like to have explicit temporal operators like *before*, *after*, and *during* since I think they're necessary for 'declarative'
* OO inheritance and polymorphism seems natural in a lot of places
* But multi-methods seem like a better default than OO's usual "object-owned" methods, and reduces the [Kingdom of Nouns](https://steve-yegge.blogspot.com/2006/03/execution-in-kingdom-of-nouns.html) problem
* Because declarative, I don't want to have to order statements.  I should never get an order-of-operations error like "variable used before initialization", but instead I should get circular logic errors
* Because declarative, I'd like to say things like, "the margin is 10% more than the length of the button's label plus double the button's padding" and if any of the three components are altered at run-time, the others compensate to uphold the constraint. This means the above function, "m = 110% * btn.text.length + 2 * btn.padding", must be solved for Padding and solved for text length, and which function is used depends on which property, margin, padding or text, was directly altered.  But solving equations for different variables can range from hard to impossible.  But not solving for each means you go the Prolog route and do brute-force searches, which isn't acceptable. 


