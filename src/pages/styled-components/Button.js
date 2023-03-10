import styled from "styled-components";

const StyledButton = styled.button`
        @import url("https://fonts.googleapis.com/css?family=Roboto:400,700&display=swap");

        text-align: center;
        font-size: large;
        font-family: Roboto;
        color: white;
        background-color: #78AA3C;
        border: 0cm;
        width: 100px;
        min-width: 50px;
        height: 50px;
        min-height: 25px;
    `;

export const Button = ( { text, onClick } ) => {
    return (
        <StyledButton onClick={onClick}> {text} </StyledButton>
    );
};