Feature: Generate Negotiation Email
  As a user preparing for a salary negotiation
  I want to generate a tailored email draft
  So that I can communicate my case effectively

  Background:
    Given I am on the home page
    And I have added the following negotiation points:
      | description              | type           |
      | Ledet nytt prosjekt      | Achievement    |
      | Markedslønn er høyere    | Market Data    |

  Scenario: Generate email draft
    When I click the "Generate Email" button
    Then I should see a generated email draft
    And the draft should include my negotiation points
    And the draft should reference my salary and inflation data
