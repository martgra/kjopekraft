Feature: Generate Argumentation Playbook
  As a user preparing for a salary negotiation
  I want to generate a tailored argumentation playbook
  So that I can structure my negotiation meeting

  Background:
    Given I am on the home page
    And I have added the following negotiation points:
      | description              | type           |
      | Ledet nytt prosjekt      | Achievement    |
      | Markedslønn er høyere    | Market Data    |

  Scenario: Generate playbook
    When I click the "Generate Playbook" button
    Then I should see a generated argumentation playbook
    And the playbook should include my negotiation points
    And the playbook should reference my salary and inflation data
