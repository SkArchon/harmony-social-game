//SPDX-License-Identifier: Unlicense
pragma solidity 0.8.1;

import "@openzeppelin/contracts/utils/Counters.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721Enumerable.sol";

import "hardhat/console.sol";

contract PoolTicket is Ownable, ERC721Enumerable {
  using Counters for Counters.Counter;

  struct UserTicketDetails {
      uint256 ticketId;
      uint256 winnings;
  }
    
  // 18 Decimals
  string private constant nftSymbol = "HMT";
  string private constant nftName = "HM1 Pool Ticket";
  uint32 private constant MaxTicketPrice = 1000000;

  // We do not want to change the price of the ticket price in the draw
  // after it has already started as this would give a positive or negative advantage
  // to the person buying next
  // (e.g. - 10 users buy tickets at 2 million each to make the pool 20 mil
  // the ticket price is made to ONE 20, the user with the 20 usd bought a ticket at
  // an advantage)
  uint256 private ticketPrice;
  uint256 private nextTicketPrice;

  Counters.Counter private tokenIdTracker;
  uint256 private lockedContractPoolAmount = 0;

  mapping(uint256 => uint256) private _winningAmounts;
  mapping(address => uint256) private accountLastPurchasedDrawMapping;

  constructor(uint32 _ticketPrice) ERC721(nftName, nftSymbol) {
      setNextDrawTicketPrice(_ticketPrice);
      ticketPrice = nextTicketPrice;
      tokenIdTracker.increment();
  }

  function allocateWinnings(uint256 tokenId, uint256 amount) internal {
      lockedContractPoolAmount += amount;
      _winningAmounts[tokenId] += amount;
  }

  function claimFunds(uint256 tokenId) external payable {
      require(_exists(tokenId), "This token Id does not exist");
      require(
          ownerOf(tokenId) == msg.sender,
          "Unable to access different owners tokens"
      );

      uint256 winningAmount = _winningAmounts[tokenId];
      require(winningAmount > 0, "This token Id did not win anything");

      payable(msg.sender).transfer(winningAmount);

      // Reduce the pool amount since user claimed it
      lockedContractPoolAmount -= winningAmount;
      _winningAmounts[tokenId] = 0;
  }

  function _buyTicket(uint256 currentDrawNumber) internal {
    require(msg.value == ticketPrice, "The amount transferred for the ticket price does not match");
    require(accountLastPurchasedDrawMapping[msg.sender] != currentDrawNumber, "The user has already purchased for the current draw");

    uint256 tokenId = tokenIdTracker.current();
    tokenIdTracker.increment();

    _safeMint(msg.sender, tokenId);
    accountLastPurchasedDrawMapping[msg.sender] = currentDrawNumber;
  }

  function _getTicketPrice() internal view returns (uint256) {
      return ticketPrice;
  }

  function _getLockedContractPoolAmount() internal view returns (uint256) {
      return lockedContractPoolAmount;
  }

  function _hasAddressPurchasedForDraw(uint256 drawNumber, address userAddress) internal view returns (bool) {
      return (accountLastPurchasedDrawMapping[userAddress] == drawNumber);
  }

  function _refreshTicketPriceForNextDraw() internal {
      ticketPrice = nextTicketPrice;
  }

  function _getLastTicketPurchased() internal view returns (uint256) {
      // Technically 0 means no tickets purchased at all
      return tokenIdTracker.current() - 1;
  }

  /**
    This function has an unchecked pagination (for now),
    If user buys million tickets, it will loop for a million
    Even though there is no gas cost as it is a view
    it will hinder UX
   */
  function hasUnclaimedWinnings(address owner) external view
    returns (
        bool userHasUnclaimedWinnings,
        uint256 lastIndex,
        uint256 totalTokens
    ) {
    uint256 tokensForOwner = ERC721.balanceOf(owner);

    for (uint256 i = 0; i < tokensForOwner; i++) {
        uint256 tokenId = tokenOfOwnerByIndex(owner, i);
        if (_winningAmounts[tokenId] > 0) {
            return (true, i, tokensForOwner);
        }
    }

    return (false, tokensForOwner, tokensForOwner);
  }


  function getUserTickets(address owner) external view returns (UserTicketDetails[] memory) {
    uint256 tokensForOwner = ERC721.balanceOf(owner);

    UserTicketDetails[] memory userTickets = new UserTicketDetails[](tokensForOwner);
    for (uint256 i = tokensForOwner; i > 0; i--) {
      uint256 index = i - 1;
      uint256 tokenId = tokenOfOwnerByIndex(owner, (index));
      UserTicketDetails memory ticket = UserTicketDetails(tokenId, _winningAmounts[tokenId]);
      userTickets[index] = ticket;
    }

    return userTickets;
  }

  //=====================================
  // Administration Setters
  //=====================================

  /**
    The function is written this way so decimals e.g. (10.50) wont be allowed.
   */
  function setNextDrawTicketPrice(uint32 newTicketPrice) public onlyOwner {
      require(newTicketPrice >= 1 && newTicketPrice <= MaxTicketPrice, "The price must be beween 1 and the max ticket price");
      nextTicketPrice = uint256(newTicketPrice) * (10 ** 18);
  }

}
