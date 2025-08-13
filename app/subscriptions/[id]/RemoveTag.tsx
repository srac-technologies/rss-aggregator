'use client';

type Props = {
  subscriptionTag: {
    tag_id: number;
    tags: {
      tag: string;
    };
  };
  subscriptionId: string;
  removeTagFromSubscription: (subscriptionId: string, tagId: number) => Promise<void>;
}
export const RemoveTag = ({ subscriptionTag, subscriptionId, removeTagFromSubscription }: Props) => {

  const doRemoveTagFromSubscription = async (subscriptionId: string, tagId: number) => {
    await removeTagFromSubscription(subscriptionId, tagId);
  }

  return <div key={subscriptionTag.tag_id} className="tag">
    {subscriptionTag.tags.tag}
    <form action={() => doRemoveTagFromSubscription(subscriptionId, subscriptionTag.tag_id)} style={{ display: 'inline' }}>
      <button type="submit" title="Remove tag">×</button>
    </form>
  </div>
}
