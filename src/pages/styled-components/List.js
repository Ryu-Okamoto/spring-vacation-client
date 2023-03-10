import styled from "styled-components";

const StyledItem = styled.li`
    @import url("https://fonts.googleapis.com/css?family=Roboto:400,700&display=swap");

    text-align: left;
    font-size: large;
    font-family: Roboto;
    color: black;
`;

const StyledList = styled.ul`
    padding-left: 0;
    list-style: none;
    display: inline-block;
`;

const StyledContents = styled.div`
    margin: 16px auto;
    text-align: center;
`;

export const List = ( {items} ) => {
    return (
        <StyledContents>
            <StyledList>
                {items.map((item) => <StyledItem key={item}>{item}</StyledItem>)}
            </StyledList>
        </StyledContents>
    );
}