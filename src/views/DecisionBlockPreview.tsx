// Temporary preview harness for reviewing DecisionBlock against fixtures
// during development. Not part of the app's real navigation.

import DecisionBlock from '../components/DecisionBlock';
import { motherChusLive } from '../fixtures/food-and-drink';
import { motherChusTarget } from '../fixtures/food-and-drink-target';

export default function DecisionBlockPreview() {
  return (
    <div className="max-w-3xl mx-auto p-8 space-y-10">
      <div>
        <h2 className="text-lg font-semibold text-blue-90 mb-1">Mother Chu's — live fixture</h2>
        <p className="text-base text-blue-80 mb-3">
          pricing and availability are both null, so From/Duration/Open don't render — but links.website is real, so the primary action still
          does. Only when every one of the four is null does the whole block render nothing.
        </p>
        <DecisionBlock product={motherChusLive} />
      </div>

      <div>
        <h2 className="text-lg font-semibold text-blue-90 mb-1">Mother Chu's — target fixture</h2>
        <p className="text-base text-blue-80 mb-3">
          price from and duration are populated; operating_days is empty (this fixture models hours via opening_hours instead) so that field is
          absent.
        </p>
        <DecisionBlock product={motherChusTarget} />
      </div>
    </div>
  );
}
