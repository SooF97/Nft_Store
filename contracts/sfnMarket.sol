// SPDX-License-Identifier: MIT
pragma solidity ^0.8.17;

import "@openzeppelin/contracts/utils/Counters.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";

contract sfnMarket is ERC721URIStorage, ReentrancyGuard {
    using Counters for Counters.Counter;
    Counters.Counter private _tokenIds;

    uint256 public numberOfTokensListed;

    uint256 listingFee = 0.00025 ether;
    address payable contractOwner;

    // struct to store any token created
    struct tokenData {
        uint256 tokenId;
        string tokenUri;
        address tokenOwner;
        address marketAddress;
        bool tokenCreated;
        bool tokenListed;
        bool tokenSold;
        uint256 price;
    }

    // mapping to map every token created with its tokenCreated struct
    mapping(uint256 => tokenData) private tokenMappingData;

    // array to store tokens created
    tokenData[] public tokensArrayData;

    // event for token created
    event tokenDataEvent(
        uint256 indexed tokenId,
        string indexed tokenUri,
        address indexed tokenOwner,
        address marketAddress,
        bool tokenCreated,
        bool tokenListed,
        bool tokenSold,
        uint256 price
    );

    constructor() ERC721("Sfn Market", "SFN") {
        contractOwner = payable(msg.sender);
    }

    /* function to mint a token */
    function createToken(
        string memory _tokenUri
    ) public nonReentrant returns (uint) {
        _tokenIds.increment();
        uint256 newTokenId = _tokenIds.current();

        _safeMint(msg.sender, newTokenId);
        _setTokenURI(newTokenId, _tokenUri);
        tokenMappingData[newTokenId] = tokenData(
            newTokenId,
            _tokenUri,
            msg.sender,
            address(this),
            true,
            false,
            false,
            0
        );
        tokensArrayData.push(tokenMappingData[newTokenId]);
        emit tokenDataEvent(
            newTokenId,
            _tokenUri,
            msg.sender,
            address(this),
            true,
            false,
            false,
            0
        );
        return newTokenId;
    }

    function fetchUserTokens() public view returns (tokenData[] memory) {
        uint256 userBalance = balanceOf(msg.sender);
        tokenData[] memory userTokens = new tokenData[](userBalance);
        uint256 index = 0;
        for (uint256 i = 0; i < tokensArrayData.length; i++) {
            if (
                tokensArrayData[i].tokenOwner == msg.sender &&
                tokensArrayData[i].tokenListed == false
            ) {
                userTokens[index] = tokensArrayData[i];
                index = index + 1;
            }
        }
        return userTokens;
    }

    function fetchListedTokens() public view returns (tokenData[] memory) {
        uint256 listedTokensNumber = numberOfTokensListed;
        tokenData[] memory listedTokens = new tokenData[](listedTokensNumber);
        uint256 index = 0;
        for (uint256 i = 0; i < tokensArrayData.length; i++) {
            if (
                tokensArrayData[i].marketAddress == address(this) &&
                tokensArrayData[i].tokenListed == true
            ) {
                listedTokens[index] = tokensArrayData[i];
                index = index + 1;
            }
        }
        return listedTokens;
    }

    function cancelTokenlisting(uint256 _tokenId) public nonReentrant {
        require(
            tokenMappingData[_tokenId].tokenOwner == msg.sender,
            "You are not the token owner!"
        );
        require(
            tokenMappingData[_tokenId].tokenListed == true,
            "Token not listed!"
        );
        _transfer(address(this), msg.sender, _tokenId);
        payable(tokenMappingData[_tokenId].tokenOwner).transfer(listingFee);
        tokenMappingData[_tokenId].tokenListed = false;
        tokenMappingData[_tokenId].price = 0;
        for (uint256 i = 0; i < tokensArrayData.length; i++) {
            if (tokensArrayData[i].tokenId == _tokenId) {
                tokensArrayData[i].tokenListed = false;
                tokensArrayData[i].price = 0;
            }
        }
        numberOfTokensListed = numberOfTokensListed - 1;
    }

    function updateTokenPrice(
        uint256 _tokenId,
        uint256 newPrice
    ) public nonReentrant {
        require(
            tokenMappingData[_tokenId].tokenOwner == msg.sender,
            "You are not the token owner!"
        );
        require(
            tokenMappingData[_tokenId].tokenListed == true,
            "Token not listed!"
        );
        tokenMappingData[_tokenId].price = newPrice;
        for (uint256 i = 0; i < tokensArrayData.length; i++) {
            if (tokensArrayData[i].tokenId == _tokenId) {
                tokensArrayData[i].price = newPrice;
            }
        }
    }

    function listToken(
        uint256 _tokenId,
        uint256 _price
    ) public payable nonReentrant {
        require(
            tokenMappingData[_tokenId].tokenOwner == msg.sender,
            "You are not the token owner!"
        );
        require(msg.value == listingFee, "Please,pay the listing fee!");
        require(
            tokenMappingData[_tokenId].tokenListed == false,
            "Token already listed!"
        );
        require(_price > 0, "Price must be greater than 0!");
        _transfer(msg.sender, address(this), _tokenId);
        tokenMappingData[_tokenId].tokenOwner = msg.sender;
        tokenMappingData[_tokenId].marketAddress = address(this);
        tokenMappingData[_tokenId].tokenListed = true;
        tokenMappingData[_tokenId].price = _price;
        for (uint256 i = 0; i < tokensArrayData.length; i++) {
            if (tokensArrayData[i].tokenId == _tokenId) {
                tokensArrayData[i].tokenOwner = msg.sender;
                tokensArrayData[i].marketAddress = address(this);
                tokensArrayData[i].tokenListed = true;
                tokensArrayData[i].price = _price;
            }
        }
        numberOfTokensListed = numberOfTokensListed + 1;
        emit tokenDataEvent(
            _tokenId,
            tokenMappingData[_tokenId].tokenUri,
            msg.sender,
            address(this),
            true,
            true,
            false,
            _price
        );
    }

    function buyToken(uint256 _tokenId) public payable nonReentrant {
        require(
            tokenMappingData[_tokenId].tokenListed == true,
            "Token is not listed!"
        );
        require(
            msg.value == tokenMappingData[_tokenId].price,
            "Please,pay the exact amount!"
        );
        _transfer(address(this), msg.sender, _tokenId);
        payable(tokenMappingData[_tokenId].tokenOwner).transfer(msg.value);
        payable(contractOwner).transfer(listingFee);
        tokenMappingData[_tokenId].tokenOwner = msg.sender;
        tokenMappingData[_tokenId].marketAddress = address(this);
        tokenMappingData[_tokenId].tokenListed = false;
        tokenMappingData[_tokenId].tokenSold = true;
        tokenMappingData[_tokenId].price = 0;
        for (uint256 i = 0; i < tokensArrayData.length; i++) {
            if (tokensArrayData[i].tokenId == _tokenId) {
                tokensArrayData[i].tokenOwner = msg.sender;
                tokensArrayData[i].marketAddress = address(this);
                tokensArrayData[i].tokenListed = false;
                tokensArrayData[i].tokenSold = true;
                tokensArrayData[i].price = 0;
            }
        }
        numberOfTokensListed = numberOfTokensListed - 1;
    }
}
