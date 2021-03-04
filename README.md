# Auto Automata

A library and web app for simulating finite automatas (DFA, NFA, and ε-NFA) and
regular expressions.

This project is a tool designed to help students ~~solve~~ understand quizzes
and assignments from the course [TMV028](https://student.portal.chalmers.se/sv/chalmersstudier/minkursinformation/Sidor/SokKurs.aspx?course_id=30562&parsergrp=3)
/[DIT322](https://www.gu.se/studera/hitta-utbildning/andliga-automater-och-formella-sprak-dit322) at
CTH. But can be used by anyone with an interest in automatas.

Contributions are welcome! If you found a bug please report an issue on GitHub
or fix it yourself. New features are also welcome.

## Features

Current features and some features that *might* be added in the future.

### Finite Automata

- [x] DFA
- [x] NFA
- [x] ε-NFA
- [x] String tests
  - [x] Web App
- [x] Subset Construction
  - [x] Web App
- [x] Product Construction
  - [x] Web App
- [x] Sum Construction
  - [x] Web App
- [x] Convert to Regular Expression
  - [x] Web App
- [x] Equality
  - [x] Web App
- [x] Minimisation
  - [x] Web App
- [ ] Parsing file formats
  - [x] ASCII table (TMV028/DIT322 specific format)
  - [ ] `.jff` from [JFLAP](http://www.jflap.org/)
- [ ] Formatting file formats
  - [x] ASCII table (TMV028/DIT322 specific format)
  - [x] LaTeX tables
  - [ ] `.jff` from [JFLAP](http://www.jflap.org/)

### Regular Expressions

- [x] String tests
  - [x] Web App
- [x] Simplification (Can always be improved)
  - [ ] Web App
- [x] Convert to Automata
  - [x] Web App

### Context Free Grammars

- [x] Parsing strings
  - [x] Constructing parse trees
    - [x] Web App
  - [x] Constructing CYK tables
    - [ ] Web App
- [x] Transformations
  - [x] Bin
    - [ ] Web App
  - [x] Del
    - [ ] Web App
  - [x] Unit
    - [ ] Web App
  - [x] Term
    - [ ] Web App
  - [x] Chomsky Normal Form
    - [ ] Web App
- [ ] Parsing file formats
  - [ ] UTF8
  - [ ] `.jff` from [JFLAP](http://www.jflap.org/)
- [x] Formatting file formats
  - [x] LaTeX
  - [x] UTF8
  - [x] `.jff` from [JFLAP](http://www.jflap.org/)

## Library

This project can also be used as a `npm` library for JavaScript or TypeScript.
It does not exist on the `npm` repository, but you can add it to your project
from GitHub with the following command:

```
npm install 89netraM/auto-automata
```
