Feature: Negotiation Tab for Salary Increase
  As a user preparing for a salary negotiation
  I want a dedicated negotiation tab
  So that I can organize my arguments and generate tailored drafts

  Background:
    Given I am on the home page

  Scenario: Accessing the negotiation tab
    When I switch to the negotiation tab
    Then I should see a form or list to add negotiation points
    And I should see options to generate an email and a playbook

  Scenario: Adding negotiation points
    When I add a negotiation point with description "Ledet nytt prosjekt" and type "Achievement"
    And I add a negotiation point with description "Markedslønn er høyere" and type "Market Data"
    Then I should see both negotiation points in the list

  Scenario: Removing a negotiation point
    Given I have added a negotiation point with description "Ekstra ansvar" and type "Responsibility"
    When I remove the negotiation point with description "Ekstra ansvar"
    Then it should no longer appear in the list
