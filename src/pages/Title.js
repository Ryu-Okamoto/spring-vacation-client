import { useState } from "react";

import titleLogo from "../logo.PNG";
import { Button } from "./styled-components/Button";

export const Title = ( {nameChangeHandler, joinClickHandler} ) => {
    const [ name, setName ] = useState("");
 
    const updateName = (e) => {
        setName(e.target.value);
        nameChangeHandler(e.target.value);
    }

    return (
        <div>
        <img src={titleLogo} alt="title logo" />
        <h2> 
            <input type = "text" value={name} onChange={updateName} />
        </h2>
        <Button text="参加！" onClick={joinClickHandler} />
        </div>
    );
};