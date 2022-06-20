// SPDX-License-Identifier: MIT

pragma solidity ^0.8.0;
import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/token/ERC721/IERC721.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/security/Pausable.sol";

/** @dev add mint owner */
contract DAW_house is ERC721, Ownable {
    IERC721 dawNFT = IERC721(address(0));
    uint256 public tokenId = 1;
    uint256 public balance;
    uint256 public mintId = 1;
    string internal baseUri;
    struct Account {
        uint256 balance;
        bool isWhitelisted;
    }
    struct MintCondition {
        uint256 minDawBalance;
        uint256 remainingSupply;
        uint256 price;
        uint256 wlPrice;
        uint256 maxPerWallet;
        uint256 notHoldersMintTimestamp;
    }
    bool public mintStarted;
    mapping(uint256 => string) private _uris;
    mapping(uint256 => MintCondition) public mintConditions;
    mapping(uint256 => mapping(address => Account)) public accounts;

    // mapping(uint256=>uint256) public minted;

    constructor() ERC721("DAW_house", "DAWH") {}

    function withdraw(uint256 amount, address payable addr) external onlyOwner {
        require(balance >= amount, "Not enough ether");
        addr.transfer(amount);
    }

    function mint(uint256 amount) external payable {
        require(amount > 0, "Increase amount");
        require(mintStarted, "Mint not started");
        Account memory account = accounts[mintId - 1][msg.sender];
        MintCondition memory currentCondition = mintConditions[mintId - 1];
        require(
            currentCondition.remainingSupply - amount >= 0,
            "Not enough tokens"
        );
        require(
            account.balance + amount <= currentCondition.maxPerWallet,
            "Tokens per wallet limit"
        );
        /**@dev requiring price */
        account.isWhitelisted
            ? require(msg.value == currentCondition.wlPrice, "Not enough ether")
            : require(msg.value == currentCondition.price, "Not enough ether");

        /**@dev for non wl holders*/
        if (
            currentCondition.notHoldersMintTimestamp > block.timestamp &&
            !account.isWhitelisted
        ) {
            require(
                1 >= currentCondition.minDawBalance, /* dawNFT.balanceOf(msg.sender) */
                "Need more DAW's nfts"
            );
        }
        // if (currentCondition.notHoldersMintTimestamp < block.timestamp) {
        //     /**@dev mint for holders */
        //     if(!account.isWhitelisted){
        //         require(dawNFT.balanceOf(msg.sender)>=currentCondition.minDawBalance,"Need more DAW's nfts");
        //     }
        // } else {
        //     /**@dev mint for non-holders */

        // }
        /**@dev mint */
        for (uint256 index = 0; index < amount; index++) {
            _mint(msg.sender, tokenId);
            accounts[mintId - 1][msg.sender].balance++;
            mintConditions[mintId - 1].remainingSupply--;
            tokenId++;
        }
        if (currentCondition.remainingSupply == 0) mintStarted = false;
    }

    /** @dev increases mintId */
    function startMint() external onlyOwner {
        require(!mintStarted, "Mint already started");
        mintStarted = true;
        mintId++;
    }

    function stopMint() external onlyOwner {
        mintStarted = false;
    }

    function setWl(address[] calldata addresses, uint256[] calldata amounts)
        external
        onlyOwner
    {
        require(!mintStarted, "Mint started");
        require(addresses.length == amounts.length, "Invalid args");
        for (uint256 index = 0; index < addresses.length; index++) {
            accounts[mintId][addresses[index]] = Account(0, true);
        }
    }

    function setCondition(MintCondition calldata condition) external onlyOwner {
        require(!mintStarted, "Mint started");
        mintConditions[mintId] = condition;
    }

    function burn(uint256 _tokenId) external onlyOwner {
        _burn(_tokenId);
    }

    function mintOwner(
        uint256[] calldata tokenIds,
        address[] calldata addresses
    ) external onlyOwner {
        require(addresses.length == tokenIds.length, "Inv args");
        for (uint256 index = 0; index < tokenIds.length; index++) {
            require(tokenIds[index] == tokenId, "Invalid tokenId");
            _mint(addresses[index], tokenIds[index]);
            tokenId++;
        }
    }

    function setUris(uint256[] calldata tokenIds, string[] calldata uris)
        external
        onlyOwner
    {
        require(tokenIds.length == uris.length, "Inv args");
        for (uint256 index = 0; index < tokenIds.length; index++) {
            _uris[tokenIds[index]] = uris[index];
        }
    }

    /** 
    @dev overrides
    */
    // function _baseURI() internal view override returns (string memory) {
    //     return baseUri;
    // }

    function tokenURI(uint256 _tokenId)
        public
        view
        override
        returns (string memory)
    {
        require(
            _exists(tokenId),
            "ERC721Metadata: URI query for nonexistent token"
        );
        return bytes(_uris[_tokenId]).length > 0 ? _uris[_tokenId] : "";
    }

    // function tokenURI (uint256 _tokenId) public view{

    // }
}
